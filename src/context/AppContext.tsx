import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { SEED_ALARMS, newAlarmId, type Alarm, type Severity } from '../data/alarms';
import { CAMERAS, type Camera } from '../data/cameras';
import { api, type NewCameraInput } from '../api/client';
import { imgFilterCss, type ImgAdjust } from '../lib/img';

type Theme = 'dark' | 'light';

/** Per-camera settings the user edits and we persist to localStorage. */
export interface CamOverride {
  name?: string;
  group?: string;
  refreshMs?: number;
  img?: ImgAdjust;
  fields?: Record<string, string>;
}

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  site: number;
  setSite: (i: number) => void;

  cameras: Camera[];
  addCamera: (input: NewCameraInput) => Promise<Camera>;
  overrides: Record<string, CamOverride>;
  saveOverride: (id: string, o: CamOverride) => void;

  query: string;
  setQuery: (q: string) => void;

  alarms: Alarm[];
  openAlarmCount: number;
  ackAlarm: (id: number) => void;
  reportCameraStatus: (id: string, name: string, status: 'ok' | 'lost') => void;

  /** Transient toast for actions that need a backend (demo affordance). */
  note: string;
  notify: (msg: string) => void;

  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;

  alarmFilter: Severity | 'all';
  setAlarmFilter: (s: Severity | 'all') => void;

  /** transient signal that a new alarm arrived — components can animate on change */
  ringTick: number;
  toast: Alarm | null;
  dismissToast: () => void;
}

const Ctx = createContext<AppState | null>(null);

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('aperture-theme');
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* storage unavailable */
  }
  return 'dark';
}

function hm(): string {
  const d = new Date();
  const p = (n: number) => (n < 10 ? '0' : '') + n;
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

function readOverrides(): Record<string, CamOverride> {
  try {
    const raw = localStorage.getItem('aperture-cam-overrides');
    if (raw) return JSON.parse(raw) as Record<string, CamOverride>;
  } catch {
    /* storage unavailable / bad json */
  }
  return {};
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const [site, setSite] = useState(0);
  const [rawCameras, setCameras] = useState<Camera[]>(CAMERAS);
  const [overrides, setOverrides] = useState<Record<string, CamOverride>>(readOverrides);
  const [alarms, setAlarms] = useState<Alarm[]>(SEED_ALARMS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alarmFilter, setAlarmFilter] = useState<Severity | 'all'>('all');
  const [ringTick, setRingTick] = useState(0);
  const [toast, setToast] = useState<Alarm | null>(null);
  const [query, setQuery] = useState('');
  const [note, setNote] = useState('');
  const camStatus = useRef<Record<string, 'ok' | 'lost'>>({});
  const noteTimer = useRef(0);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem('aperture-theme', t); } catch { /* ignore */ }
  }, []);
  const toggleTheme = useCallback(() => setTheme(theme === 'light' ? 'dark' : 'light'), [theme, setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const ackAlarm = useCallback((id: number) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, ack: true } : a)));
  }, []);

  const notify = useCallback((msg: string) => {
    setNote(msg);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(''), 2600);
  }, []);

  // Real alarms driven by camera up/down transitions detected by the player.
  const reportCameraStatus = useCallback((id: string, name: string, status: 'ok' | 'lost') => {
    const prev = camStatus.current[id];
    if (prev === status) return;
    camStatus.current[id] = status;
    if (prev === undefined) return; // first observation — no alarm
    const a: Alarm = status === 'lost'
      ? { id: newAlarmId(), sev: 'crit', title: `Camera offline · ${name}`, sub: `${id} · signal lost · ${hm()}`, kind: 'alert', icon: '<path d="M2 20h.01M6 20a10 10 0 0116 0"/><path d="M3 3l18 18"/>', ack: false }
      : { id: newAlarmId(), sev: 'infob', title: `Camera back online · ${name}`, sub: `${id} · reconnected · ${hm()}`, kind: 'accent', icon: '<path d="M2 20h.01M6 20a10 10 0 0116 0"/>', ack: false };
    setAlarms((p) => [a, ...p].slice(0, 20));
    setRingTick((t) => t + 1);
    if (a.sev === 'crit') setToast(a);
  }, []);

  const saveOverride = useCallback((id: string, o: CamOverride) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: o };
      try { localStorage.setItem('aperture-cam-overrides', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Cameras with the user's saved overrides applied (name, poll rate, image filter).
  const cameras = useMemo<Camera[]>(() => rawCameras.map((c) => {
    const o = overrides[c.id];
    if (!o) return c;
    return {
      ...c,
      n: o.name || c.n,
      refreshMs: o.refreshMs ?? c.refreshMs,
      imgFilter: o.img ? imgFilterCss(o.img) : c.imgFilter,
    };
  }), [rawCameras, overrides]);

  const addCamera = useCallback(async (input: NewCameraInput): Promise<Camera> => {
    const cam = await api.cameras.add(input);
    setCameras((prev) => [...prev, cam]);
    return cam;
  }, []);

  // Load cameras from the API on mount (falls back to the seeded list).
  useEffect(() => {
    let alive = true;
    api.cameras.list().then((list) => { if (alive) setCameras(list); }).catch(() => { /* keep seed */ });
    return () => { alive = false; };
  }, []);

  // Alarms are now driven by real camera up/down events via reportCameraStatus
  // (called by the player), not a simulated feed.

  // auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const openAlarmCount = useMemo(() => alarms.filter((a) => !a.ack).length, [alarms]);

  const value: AppState = {
    theme, toggleTheme, setTheme,
    site, setSite,
    cameras, addCamera, overrides, saveOverride,
    query, setQuery,
    alarms, openAlarmCount, ackAlarm, reportCameraStatus, note, notify,
    drawerOpen, setDrawerOpen,
    alarmFilter, setAlarmFilter,
    ringTick, toast, dismissToast: () => setToast(null),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}

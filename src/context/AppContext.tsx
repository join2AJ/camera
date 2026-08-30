import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { SEED_ALARMS, type Alarm, type Severity } from '../data/alarms';
import { CAMERAS, type Camera } from '../data/cameras';
import { api, type NewCameraInput } from '../api/client';

type Theme = 'dark' | 'light';

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  site: number;
  setSite: (i: number) => void;

  cameras: Camera[];
  addCamera: (input: NewCameraInput) => Promise<Camera>;

  alarms: Alarm[];
  openAlarmCount: number;
  ackAlarm: (id: number) => void;

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const [site, setSite] = useState(0);
  const [cameras, setCameras] = useState<Camera[]>(CAMERAS);
  const [alarms, setAlarms] = useState<Alarm[]>(SEED_ALARMS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alarmFilter, setAlarmFilter] = useState<Severity | 'all'>('all');
  const [ringTick, setRingTick] = useState(0);
  const [toast, setToast] = useState<Alarm | null>(null);

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

  // Live alarm feed — subscribe to the API's alarm stream after a short delay.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const start = window.setTimeout(() => {
      unsubscribe = api.alarms.stream((alarm) => {
        setAlarms((prev) => [alarm, ...prev].slice(0, 12));
        setRingTick((t) => t + 1);
        if (alarm.sev === 'crit') setToast(alarm);
      });
    }, 6000);
    return () => {
      window.clearTimeout(start);
      unsubscribe?.();
    };
  }, []);

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
    cameras, addCamera,
    alarms, openAlarmCount, ackAlarm,
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

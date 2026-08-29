import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { INCOMING, SEED_ALARMS, newAlarmId, type Alarm, type Severity } from '../data/alarms';

type Theme = 'dark' | 'light';

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  site: number;
  setSite: (i: number) => void;

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

function hm(): string {
  const d = new Date();
  const p = (n: number) => (n < 10 ? '0' : '') + n;
  return p(d.getHours()) + ':' + p(d.getMinutes());
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const [site, setSite] = useState(0);
  const [alarms, setAlarms] = useState<Alarm[]>(SEED_ALARMS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alarmFilter, setAlarmFilter] = useState<Severity | 'all'>('all');
  const [ringTick, setRingTick] = useState(0);
  const [toast, setToast] = useState<Alarm | null>(null);
  const inPtr = useRef(0);

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

  // Live alarm feed — a new alarm every ~14s after an initial delay.
  useEffect(() => {
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        const src = INCOMING[inPtr.current % INCOMING.length];
        inPtr.current += 1;
        const alarm: Alarm = { ...src, id: newAlarmId(), ack: false, sub: `${src.sub} · ${hm()}` };
        setAlarms((prev) => [alarm, ...prev].slice(0, 12));
        setRingTick((t) => t + 1);
        if (alarm.sev === 'crit') setToast(alarm);
      }, 14000);
    }, 6000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
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

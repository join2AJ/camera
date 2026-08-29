import { useEffect, useState } from 'react';

const pad = (n: number) => (n < 10 ? '0' : '') + n;

/** Ticking wall clock. Returns HH:MM:SS and a full YYYY-MM-DD HH:MM:SS stamp. */
export function useClock(): { time: string; stamp: string } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(iv);
  }, []);
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const y = now.getFullYear();
  const stamp = `${y}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${time}`;
  return { time, stamp };
}

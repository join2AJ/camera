import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SITES } from '../data/sites';
import { useClock } from '../hooks/useClock';
import { bellIcon, moonIcon, sunIcon } from './icons';

export function TopBar({ title }: { title: string }) {
  const app = useApp();
  const nav = useNavigate();
  const { time } = useClock();
  const [siteMenu, setSiteMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [ring, setRing] = useState(false);
  const firstRing = useRef(true);

  const site = SITES[app.site];

  // ring the bell whenever a new alarm arrives
  useEffect(() => {
    if (firstRing.current) { firstRing.current = false; return; }
    setRing(true);
    const t = window.setTimeout(() => setRing(false), 700);
    return () => window.clearTimeout(t);
  }, [app.ringTick]);

  // close menus on outside click
  useEffect(() => {
    if (!siteMenu && !userMenu) return;
    const close = () => { setSiteMenu(false); setUserMenu(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [siteMenu, userMenu]);

  return (
    <header className="top">
      <span className="wordmark">APER<b>TURE</b></span>
      <span className="view-title">{title}</span>
      <div className="top-sp" />
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
        Search cameras…
      </div>

      <div className="menu-wrap" onClick={(e) => e.stopPropagation()}>
        <button className="site-btn" onClick={() => { setSiteMenu((v) => !v); setUserMenu(false); }}>
          <span className="sdot" style={{ background: site.online ? 'var(--online)' : 'var(--alert)' }} />
          <span className="sname">{site.name}</span>
          <span className="scount">{site.count}</span>
          <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <div className={`menu${siteMenu ? ' on' : ''}`}>
          <div className="menu-h">Switch site</div>
          {SITES.map((s, i) => (
            <button key={s.name} className={`menu-item${i === app.site ? ' sel' : ''}`} onClick={() => { app.setSite(i); setSiteMenu(false); nav('/live'); }}>
              <span className="mi-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M9 21v-5h6v5" /></svg></span>
              <span className="mi-t">{s.name}<span>{s.count} cameras online</span></span>
              <span className="mi-chk"><svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M20 6L9 17l-5-5" /></svg></span>
            </button>
          ))}
        </div>
      </div>

      <span className="clock">{time}</span>

      <button className="icon-btn" aria-label="Toggle theme" onClick={app.toggleTheme}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{app.theme === 'light' ? sunIcon : moonIcon}</svg>
      </button>

      <button className={`bell${ring ? ' ring' : ''}`} aria-label="Alarms" onClick={() => app.setDrawerOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{bellIcon}</svg>
        {app.openAlarmCount > 0 && <span className={`badge${ring ? ' pop' : ''}`}>{app.openAlarmCount}</span>}
      </button>

      <div className="menu-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="avatar" onClick={() => { setUserMenu((v) => !v); setSiteMenu(false); }}>AK</div>
        <div className={`menu${userMenu ? ' on' : ''}`}>
          <div className="menu-h">Ada Kessler · Admin</div>
          <button className="menu-item" onClick={() => { setUserMenu(false); nav('/system'); }}>
            <span className="mi-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 00.3 1.8M4.6 9A1.6 1.6 0 004.3 7" /></svg></span>
            <span className="mi-t">System settings<span>Org, recording, network</span></span>
          </button>
          <button className="menu-item" onClick={() => { setUserMenu(false); app.toggleTheme(); }}>
            <span className="mi-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{sunIcon}</svg></span>
            <span className="mi-t">Theme<span>{app.theme === 'light' ? 'Light' : 'Dark'}</span></span>
          </button>
          <div className="menu-sep" />
          <button className="menu-item">
            <span className="mi-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg></span>
            <span className="mi-t">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

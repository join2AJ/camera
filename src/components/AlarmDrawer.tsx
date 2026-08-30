import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { iconBg, iconFg, type Severity } from '../data/alarms';

const FILTERS: { key: Severity | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'crit', label: 'Critical' },
  { key: 'warnb', label: 'Warning' },
  { key: 'infob', label: 'Info' },
];

export function AlarmDrawer() {
  const app = useApp();
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') app.setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [app]);

  const visible = app.alarms.filter((a) => app.alarmFilter === 'all' || a.sev === app.alarmFilter);

  return (
    <>
      <div className={`scrim${app.drawerOpen ? ' on' : ''}`} onClick={() => app.setDrawerOpen(false)} />
      <aside className={`drawer${app.drawerOpen ? ' on' : ''}`} aria-hidden={!app.drawerOpen}>
        <div className="drawer-head">
          <h3>Alarm Center</h3>
          <button className="x" aria-label="Close" onClick={() => app.setDrawerOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="alarm-filters">
          {FILTERS.map((f) => (
            <button key={f.key} className={`afil${app.alarmFilter === f.key ? ' on' : ''}`} onClick={() => app.setAlarmFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <div className="alarms">
          {visible.map((a) => (
            <div key={a.id} className={`alarm ${a.sev}${a.ack ? ' ack' : ''}`}>
              <div className="ai-ico" style={{ background: iconBg(a.kind), color: iconFg(a.kind) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} dangerouslySetInnerHTML={{ __html: a.icon }} />
              </div>
              <div className="body">
                <div className="t">{a.title}</div>
                <div className="s">{a.sub}</div>
                {!a.ack && (
                  <div className="acts">
                    <button onClick={() => app.ackAlarm(a.id)}>Acknowledge</button>
                    <button onClick={() => { app.setDrawerOpen(false); nav('/live'); }}>View feed</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

export function LiveToast() {
  const app = useApp();
  const nav = useNavigate();
  const t = app.toast;
  return (
    <div className={`live-toast${t ? ' on' : ''}`} onClick={() => { app.dismissToast(); app.setDrawerOpen(true); nav('/live'); }}>
      <div className="lt-ic">
        {t && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} dangerouslySetInnerHTML={{ __html: t.icon }} />}
      </div>
      <div className="lt-b">
        <div className="t">{t?.title}</div>
        <div className="s">{t?.sub}</div>
      </div>
    </div>
  );
}

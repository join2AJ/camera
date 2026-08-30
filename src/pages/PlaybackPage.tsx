import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraVideo } from '../components/CameraVideo';
import { useApp } from '../context/AppContext';

const pad = (n: number) => (n < 10 ? '0' : '') + n;
function pctToTc(pct: number): string {
  const secs = Math.round((pct / 100) * 86400);
  return `${pad(Math.floor(secs / 3600))}:${pad(Math.floor((secs % 3600) / 60))}:${pad(secs % 60)}`;
}

type EvKind = 'ai' | 'accent' | 'alert' | 'motion';
interface Ev { title: string; sub: string; kind: EvKind; icon: string; hours: number; }
const EVENTS: Ev[] = [
  { title: 'Face match · A. Okafor · FID-0044', sub: '14:32 · West Entrance', kind: 'ai', icon: '<circle cx="12" cy="9" r="4"/><path d="M5 20a7 7 0 0114 0"/>', hours: 14.53 },
  { title: 'Person detected', sub: '14:18 · Lobby', kind: 'accent', icon: '<circle cx="12" cy="8" r="3.5"/><path d="M6 20a6 6 0 0112 0"/>', hours: 14.3 },
  { title: 'Fence breach · Zone A', sub: '13:47 · Loading Dock', kind: 'alert', icon: '<path d="M12 2l9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6z"/>', hours: 13.78 },
  { title: 'Motion · sustained', sub: '12:30 · Parking Lot A', kind: 'motion', icon: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>', hours: 12.5 },
  { title: 'Unknown face', sub: '12:19 · Reception', kind: 'ai', icon: '<circle cx="12" cy="9" r="4"/><path d="M5 20a7 7 0 0114 0"/>', hours: 12.32 },
  { title: 'Vehicle · plate 7XY·B420', sub: '11:58 · Garage Gate', kind: 'accent', icon: '<path d="M3 12l2-5h14l2 5v6H3zM6 18v2M18 18v2"/>', hours: 11.97 },
  { title: 'Motion', sub: '09:12 · Corridor 2F', kind: 'motion', icon: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>', hours: 9.2 },
];
const colorOf = (k: EvKind) => k === 'ai' ? 'var(--ai)' : k === 'alert' ? 'var(--alert)' : k === 'motion' ? 'var(--motion)' : 'var(--accent)';
const bgOf = (k: EvKind) => k === 'ai' ? 'rgba(163,113,247,.14)' : k === 'alert' ? 'rgba(229,83,75,.14)' : k === 'motion' ? 'rgba(217,164,65,.14)' : 'rgba(53,201,216,.14)';

const SEGMENTS: [number, number, string][] = [
  [2, 10, 'var(--motion)'], [6.5, 4, 'var(--motion)'], [8.1, 3, 'var(--accent)'], [9, 6, 'var(--motion)'],
  [11.5, 2, 'var(--accent)'], [12.3, 3, 'var(--ai)'], [14.5, 8, 'var(--accent)'], [16, 4, 'var(--motion)'],
  [17.2, 2, 'var(--alert)'], [18.5, 5, 'var(--ai)'], [20, 7, 'var(--motion)'], [22.4, 3, 'var(--alert)'],
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MSHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PlaybackPage() {
  const { cameras } = useApp();
  const [head, setHead] = useState((14.53 / 24) * 100);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // calendar
  const [calOpen, setCalOpen] = useState(false);
  const [calY, setCalY] = useState(2026);
  const [calM, setCalM] = useState(7);
  const [sel, setSel] = useState({ y: 2026, m: 7, d: 29 });
  const today = { y: 2026, m: 7, d: 29 };

  const clamp = (p: number) => Math.max(0, Math.min(100, p));
  const posFromEvent = useCallback((clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    setHead(clamp(((clientX - r.left) / r.width) * 100));
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => { if (dragging.current) posFromEvent(e.clientX); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [posFromEvent]);

  useEffect(() => {
    if (!playing) return;
    const iv = window.setInterval(() => setHead((h) => (h + 0.08 * speed > 100 ? 0 : h + 0.08 * speed)), 120);
    return () => window.clearInterval(iv);
  }, [playing, speed]);

  useEffect(() => {
    if (!calOpen) return;
    const close = () => setCalOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [calOpen]);

  const tc = pctToTc(head);
  const label = `${MSHORT[sel.m]} ${sel.d}, ${sel.y}`;

  const daysInMonth = new Date(calY, calM + 1, 0).getDate();
  const firstDow = new Date(calY, calM, 1).getDay();

  return (
    <section>
      <div className="vhead">
        <div><h2>Playback &amp; Review</h2><p>Cam 01 · West Entrance · recorded to encrypted local array</p></div>
        <div className="toolbar datepick">
          <div className="cal-wrap" onClick={(e) => e.stopPropagation()}>
            <button className="btn" onClick={() => setCalOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
              <span>{label}</span>
            </button>
            <div className={`cal${calOpen ? ' on' : ''}`}>
              <div className="cal-head">
                <button onClick={() => { const m = calM - 1; if (m < 0) { setCalM(11); setCalY(calY - 1); } else setCalM(m); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><path d="M15 18l-6-6 6-6" /></svg></button>
                <b>{MONTHS[calM]} {calY}</b>
                <button onClick={() => { const m = calM + 1; if (m > 11) { setCalM(0); setCalY(calY + 1); } else setCalM(m); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><path d="M9 18l6-6-6-6" /></svg></button>
              </div>
              <div className="cal-grid">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="cal-dow">{d}</div>)}
                {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const future = calY > today.y || (calY === today.y && calM > today.m) || (calY === today.y && calM === today.m && d > today.d);
                  const isSel = calY === sel.y && calM === sel.m && d === sel.d;
                  return (
                    <button key={d} disabled={future} className={`cal-day${future ? '' : ' rec'}${isSel ? ' sel' : ''}`}
                      onClick={() => { setSel({ y: calY, m: calM, d }); setCalOpen(false); }}>{d}</button>
                  );
                })}
              </div>
              <div className="cal-note"><i />Recording available on this day</div>
            </div>
          </div>
          <button className="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>Export clip</button>
        </div>
      </div>

      <div className="pb-wrap">
        <div className="pb-main">
          <div className="pb-player">
            {cameras[0] && <CameraVideo camera={cameras[0]} index={0} />}
            <div className="scanline" />
            <div className="cam-top">
              <div className="cam-name">West Entrance <span className="id">CAM-01 · 4K</span></div>
              <span className="chip motion"><span className="d" style={{ background: 'var(--motion)' }} />Motion</span>
            </div>
            <div className="cam-bot"><span className="ts">2026-08-29 {tc}</span><span className="ts" style={{ color: 'var(--faint)' }}>×{speed.toFixed(1)}</span></div>
            <div className="bbox person" style={{ left: '44%', top: '38%', width: '15%', height: '44%' }}><span className="lb">Person 0.96</span></div>
          </div>
          <div className="pb-controls">
            <button className="play" onClick={() => setPlaying((p) => !p)}>
              <svg viewBox="0 0 24 24" fill="currentColor">{playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}</svg>
            </button>
            <div className="tc"><b>{tc}</b> / 24:00:00</div>
            <div className="top-sp" style={{ flex: 1 }} />
            <div className="speed">
              {[0.5, 1, 2, 4, 8].map((s) => (
                <button key={s} className={speed === s ? 'on' : ''} onClick={() => setSpeed(s)}>{s}×</button>
              ))}
            </div>
          </div>
          <div className="timeline">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 9 }}>
              <span className="eyebrow">24-Hour Timeline</span>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }} className="mono">1,204 events</span>
            </div>
            <div className="tl-track" ref={trackRef} onMouseDown={(e) => { dragging.current = true; posFromEvent(e.clientX); }}>
              <div className="tl-seg" style={{ left: 0, right: 0, background: 'rgba(63,185,80,.28)' }} />
              {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
                <div key={h} className="tl-hour" style={{ left: `${(h / 24) * 100}%` }}><span>{pad(h)}:00</span></div>
              ))}
              {SEGMENTS.map((s, i) => (
                <div key={i} className="tl-seg" style={{ left: `${(s[0] / 24) * 100}%`, width: `${s[1] / 10}%`, background: s[2] }} />
              ))}
              <div className="tl-head" style={{ left: `${head}%` }} />
            </div>
            <div className="tl-legend">
              <span><i style={{ background: 'var(--online)' }} />Continuous</span>
              <span><i style={{ background: 'var(--motion)' }} />Motion</span>
              <span><i style={{ background: 'var(--accent)' }} />Person</span>
              <span><i style={{ background: 'var(--ai)' }} />Face match</span>
              <span><i style={{ background: 'var(--alert)' }} />Fence breach</span>
            </div>
          </div>
        </div>

        <aside className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 className="eyebrow">Events · Today</h4>
          <div className="events">
            {EVENTS.map((ev, i) => (
              <div key={i} className="event" title={`Jump to ${ev.sub.split(' · ')[0]}`} onClick={() => setHead((ev.hours / 24) * 100)}>
                <div className="ico" style={{ background: bgOf(ev.kind), color: colorOf(ev.kind) }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} dangerouslySetInnerHTML={{ __html: ev.icon }} />
                </div>
                <div className="meta"><div className="t">{ev.title}</div><div className="s">{ev.sub}</div></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

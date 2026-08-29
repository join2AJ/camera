import { useState } from 'react';
import { CAMERAS } from '../data/cameras';

interface MapCam { ci: number; x: number; y: number; dir: number; off?: boolean; }
const MAPCAMS: MapCam[] = [
  { ci: 0, x: 70, y: 120, dir: 0 },
  { ci: 2, x: 150, y: 110, dir: 20 },
  { ci: 8, x: 300, y: 110, dir: 160 },
  { ci: 7, x: 560, y: 150, dir: 200 },
  { ci: 3, x: 470, y: 400, dir: 280 },
  { ci: 6, x: 660, y: 390, dir: 250 },
  { ci: 4, x: 300, y: 460, dir: 90 },
  { ci: 10, x: 120, y: 420, dir: 70, off: true },
];

function conePath(x: number, y: number, dir: number, len: number, spread: number): string {
  const a1 = ((dir - spread) * Math.PI) / 180;
  const a2 = ((dir + spread) * Math.PI) / 180;
  return `M${x} ${y} L${x + len * Math.cos(a1)} ${y + len * Math.sin(a1)} A${len} ${len} 0 0 1 ${x + len * Math.cos(a2)} ${y + len * Math.sin(a2)} Z`;
}

const camPin = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10l4-2v8l-4-2z" /></svg>;

export function MapPage() {
  const [sel, setSel] = useState(0);
  const m = MAPCAMS[sel];
  const cam = CAMERAS[m.ci];

  return (
    <section>
      <div className="vhead">
        <div><h2>Site Map</h2><p>North Campus · Ground Floor · camera positions &amp; coverage</p></div>
        <div className="toolbar">
          <button className="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>Ground Floor</button>
          <button className="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v18M3 12h18" /></svg>Show coverage</button>
        </div>
      </div>
      <div className="map-wrap">
        <div className="floorplan">
          <svg className="fp-svg" viewBox="0 0 800 560" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1a232e" strokeWidth={1} /></pattern>
              <radialGradient id="cone" cx="0%" cy="50%" r="100%"><stop offset="0%" stopColor="#35c9d8" stopOpacity=".34" /><stop offset="100%" stopColor="#35c9d8" stopOpacity="0" /></radialGradient>
            </defs>
            <rect x="0" y="0" width="800" height="560" fill="url(#grid)" />
            <g fill="none" stroke="#334458" strokeWidth={2.5}>
              <rect x="40" y="40" width="720" height="480" rx="6" fill="#111a24" />
              <line x1="40" y1="220" x2="380" y2="220" /><line x1="380" y1="40" x2="380" y2="300" />
              <line x1="380" y1="300" x2="760" y2="300" /><line x1="560" y1="300" x2="560" y2="520" />
              <line x1="200" y1="220" x2="200" y2="520" />
            </g>
            <g fill="#6b7c90" fontSize={13} fontFamily="Chakra Petch,sans-serif" letterSpacing={1} opacity={0.8}>
              <text x="120" y="135">LOBBY</text><text x="245" y="135">RECEPTION</text>
              <text x="540" y="180">ATRIUM</text><text x="95" y="380">CAFETERIA</text>
              <text x="300" y="420">CORRIDOR</text><text x="440" y="420">LOADING DOCK</text>
              <text x="620" y="420">SERVER RM</text>
            </g>
            <g>
              {MAPCAMS.map((c, idx) => c.off ? null : (
                <path key={idx} d={conePath(c.x, c.y, c.dir, 170, 26)} fill="url(#cone)" opacity={idx === sel ? 1 : 0.55} />
              ))}
            </g>
          </svg>
          <div>
            {MAPCAMS.map((c, idx) => (
              <div key={idx} className={`cam-pin${c.off ? ' off' : ''}${idx === sel ? ' sel' : ''}`}
                style={{ left: `${(c.x / 800) * 100}%`, top: `${(c.y / 560) * 100}%` }} onClick={() => setSel(idx)}>
                <div className="dot">{camPin}</div>
                {idx === sel && <div className="plabel">{CAMERAS[c.ci].n} · {CAMERAS[c.ci].id}</div>}
              </div>
            ))}
          </div>
        </div>
        <aside className="card" style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h4 className="eyebrow" style={{ marginBottom: 8 }}>Cameras on this floor</h4>
          <div style={{ overflow: 'auto' }}>
            {MAPCAMS.map((c, idx) => (
              <div key={idx} className={`maplist-item${idx === sel ? ' sel' : ''}`} onClick={() => setSel(idx)}>
                <div className="mi" style={c.off ? { background: 'rgba(91,106,125,.12)', color: 'var(--faint)' } : undefined}>{camPin}</div>
                <div className="mt">{CAMERAS[c.ci].n}<span>{CAMERAS[c.ci].id} · {CAMERAS[c.ci].loc}</span></div>
                {c.off ? <span className="chip off" style={{ padding: '2px 6px' }}><span className="d" /></span> : <span className="chip online" style={{ padding: '2px 6px' }}><span className="d" /></span>}
              </div>
            ))}
          </div>
          <div className="panel-block" style={{ marginTop: 8 }}>
            <h4>{cam.n}</h4>
            <div className="kv"><span className="k">ID</span><span className="v">{cam.id}</span></div>
            <div className="kv"><span className="k">Type</span><span className="v">{cam.loc}</span></div>
            <div className="kv"><span className="k">Coverage</span><span className="v">~52° · 18m</span></div>
            <div className="kv"><span className="k">Status</span><span className="v" style={{ color: m.off ? 'var(--faint)' : 'var(--online)' }}>{m.off ? 'Offline' : 'Recording'}</span></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

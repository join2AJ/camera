import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

const camPin = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10l4-2v8l-4-2z" /></svg>;

/** Web-Mercator projection (good enough at city scale). */
function mercator(lat: number, lng: number) {
  return { x: lng, y: Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) };
}

export function MapPage() {
  const { cameras } = useApp();
  const geo = useMemo(() => cameras.filter((c) => typeof c.lat === 'number' && typeof c.lng === 'number'), [cameras]);
  const [sel, setSel] = useState(0);

  // Normalize projected coordinates into the plot area (with padding).
  const points = useMemo(() => {
    if (geo.length === 0) return [];
    const pr = geo.map((c) => mercator(c.lat!, c.lng!));
    const xs = pr.map((p) => p.x), ys = pr.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const spanX = maxX - minX || 1, spanY = maxY - minY || 1;
    const pad = 10; // percent
    return pr.map((p) => ({
      left: pad + ((p.x - minX) / spanX) * (100 - pad * 2),
      top: pad + ((maxY - p.y) / spanY) * (100 - pad * 2), // invert: north is up
    }));
  }, [geo]);

  const cam = geo[sel];

  return (
    <section>
      <div className="vhead">
        <div><h2>Site Map</h2><p>{geo.length} cameras · live geographic positions</p></div>
        <div className="toolbar">
          <button className="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" /><circle cx="12" cy="9" r="2.5" /></svg>New York City</button>
        </div>
      </div>
      <div className="map-wrap">
        <div className="floorplan">
          <svg className="fp-svg" viewBox="0 0 800 560" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#1a232e" strokeWidth={1} /></pattern>
            </defs>
            <rect x="0" y="0" width="800" height="560" fill="url(#grid)" />
            <text x="20" y="34" fill="#3a4a5e" fontSize={13} fontFamily="Chakra Petch,sans-serif" letterSpacing={2}>MANHATTAN · NYC</text>
          </svg>
          <div>
            {geo.map((c, idx) => (
              <div key={c.id} className={`cam-pin${idx === sel ? ' sel' : ''}`}
                style={{ left: `${points[idx].left}%`, top: `${points[idx].top}%` }} onClick={() => setSel(idx)}>
                <div className="dot">{camPin}</div>
                {idx === sel && <div className="plabel">{c.n} · {c.id}</div>}
              </div>
            ))}
          </div>
        </div>
        <aside className="card" style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h4 className="eyebrow" style={{ marginBottom: 8 }}>Cameras · {geo.length}</h4>
          <div style={{ overflow: 'auto' }}>
            {geo.map((c, idx) => (
              <div key={c.id} className={`maplist-item${idx === sel ? ' sel' : ''}`} onClick={() => setSel(idx)}>
                <div className="mi">{camPin}</div>
                <div className="mt">{c.n}<span>{c.id} · {c.loc}</span></div>
                <span className="chip online" style={{ padding: '2px 6px' }}><span className="d" /></span>
              </div>
            ))}
          </div>
          {cam && (
            <div className="panel-block" style={{ marginTop: 8 }}>
              <h4>{cam.n}</h4>
              <div className="kv"><span className="k">ID</span><span className="v">{cam.id}</span></div>
              <div className="kv"><span className="k">Type</span><span className="v">{cam.loc}</span></div>
              <div className="kv"><span className="k">Lat</span><span className="v">{cam.lat!.toFixed(5)}</span></div>
              <div className="kv"><span className="k">Lng</span><span className="v">{cam.lng!.toFixed(5)}</span></div>
              <div className="kv"><span className="k">Status</span><span className="v" style={{ color: 'var(--online)' }}>Live</span></div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

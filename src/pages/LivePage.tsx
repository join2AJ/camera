import { useEffect, useState } from 'react';
import type { Camera } from '../data/cameras';
import { Chip, Scene, TimeStamp, ViewHead } from '../components/common';
import { CameraVideo } from '../components/CameraVideo';
import { AddCameraWizard } from '../components/AddCameraWizard';
import { useApp } from '../context/AppContext';

const BOX_POS = [
  { left: '44%', top: '40%', width: '14%', height: '46%' },
  { left: '30%', top: '50%', width: '12%', height: '40%' },
  { left: '62%', top: '44%', width: '13%', height: '42%' },
];

function Boxes({ cam, slot }: { cam: Camera; slot: number }) {
  if (cam.people <= 0) return null;
  const p = Math.min(cam.people, 2);
  return (
    <>
      {Array.from({ length: p }).map((_, i) => {
        const b = BOX_POS[(slot + i) % BOX_POS.length];
        const isFace = cam.face && i === 0;
        const label = isFace ? 'FID-0044 · A. Okafor' : `Person 0.${90 + ((slot * 7 + i * 3) % 9)}`;
        return (
          <div key={i} className={`bbox ${isFace ? 'face' : 'person'}`} style={b}>
            <span className="lb">{label}</span>
          </div>
        );
      })}
    </>
  );
}

const LAYOUTS = [
  { cols: 2, label: 'Layout · 2×2' },
  { cols: 3, label: 'Layout · 3×3' },
  { cols: 1, label: 'Layout · 1-up' },
];

export function LivePage() {
  const { cameras, query } = useApp();
  const [selected, setSelected] = useState(0);
  const [wall, setWall] = useState([0, 1, 2, 3]);
  const [wizard, setWizard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [layout, setLayout] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width:720px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (ci: number) => {
    const c = cameras[ci];
    return !q || c.n.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.loc.toLowerCase().includes(q);
  };

  // With a search active, show every match. Otherwise: all cameras on phones, the 2×2 wall on desktop.
  const base = q ? cameras.map((_, i) => i).filter(matches) : (isMobile ? cameras.map((_, i) => i) : wall);
  const shown = base;
  const cols = LAYOUTS[layout].cols;

  const select = (ci: number) => {
    setSelected(ci);
    setWall((w) => (w.includes(ci) ? w : [ci, ...w.slice(1)]));
  };

  return (
    <section>
      {wizard && <AddCameraWizard onClose={() => setWizard(false)} />}
      {focus !== null && cameras[focus] && (
        <div className="fs-scrim" onClick={() => setFocus(null)}>
          <div className="fs-head" onClick={(e) => e.stopPropagation()}>
            <div className="fn">{cameras[focus].n}<span>{cameras[focus].id} · {cameras[focus].loc}</span></div>
            <button className="x" aria-label="Close" onClick={() => setFocus(null)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}><path d="M18 6L6 18M6 6l12 12" /></svg></button>
          </div>
          <div className="fs-body" onClick={(e) => e.stopPropagation()}>
            <CameraVideo camera={cameras[focus]} index={focus} style={{ objectFit: 'contain' }} />
          </div>
        </div>
      )}
      <ViewHead
        title="Live Wall"
        subtitle={q
          ? `${shown.length} camera${shown.length === 1 ? '' : 's'} matching “${query.trim()}”`
          : `Live feeds · ${shown.length} of ${cameras.length} cameras`}
        actions={
          <>
            <button className="btn" onClick={() => setWizard(true)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>Add camera</button>
            <button className="btn" onClick={() => setLayout((l) => (l + 1) % LAYOUTS.length)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>{LAYOUTS[layout].label}</button>
          </>
        }
      />

      <div className="live-grid">
        <div className="wall" style={isMobile ? undefined : { gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: '1fr', gridTemplateRows: 'none' }}>
          {shown.length === 0 && <div style={{ color: 'var(--muted)', padding: 24 }}>No cameras match your search.</div>}
          {shown.map((ci) => {
            const cam = cameras[ci];
            if (!cam) return null;
            const isSel = ci === selected;
            return (
              <div key={ci} className={`cam${isSel ? ' sel' : ''}`} onClick={() => select(ci)}>
                <CameraVideo camera={cam} index={ci} />
                <div className="scanline" />
                <button className="expand" title="Fullscreen" onClick={(e) => { e.stopPropagation(); setFocus(ci); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" /></svg>
                </button>
                <div className="cam-top">
                  <div className="cam-name">{cam.n}<span className="id">{cam.id} · {cam.loc}</span></div>
                  <Chip kind="online">Live</Chip>
                </div>
                {cam.people > 0 && <div className="count-badge"><b>{cam.people}</b>people</div>}
                <Boxes cam={cam} slot={ci} />
                <div className="cam-bot">
                  <TimeStamp />
                </div>
              </div>
            );
          })}
        </div>

        <aside className="cam-panel">
          <div className="panel-block" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <h4>Cameras · {cameras.length}</h4>
            <div className="camlist">
              {cameras.map((_, i) => i).filter(matches).map((i) => {
                const cam = cameras[i];
                return (
                  <div key={cam.id} className={`camlist-item${i === selected ? ' sel' : ''}`} onClick={() => select(i)}>
                    <div className="thumb"><Scene index={i} /></div>
                    <div className="nm">{cam.n}<span>{cam.id}</span></div>
                    <Chip kind="online" style={{ padding: '2px 6px' }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="panel-block">
            <h4>Selected Feed · {cameras[selected]?.id ?? '—'}</h4>
            <div className="kv"><span className="k">Resolution</span><span className="v">3840×2160</span></div>
            <div className="kv"><span className="k">Bitrate</span><span className="v">8.2 Mbps</span></div>
            <div className="kv"><span className="k">Codec</span><span className="v">H.265</span></div>
            <div className="kv"><span className="k">Latency</span><span className="v" style={{ color: 'var(--online)' }}>180 ms</span></div>
          </div>
        </aside>
      </div>

      <div className="live-strip">
        <div className="metric"><div className="mv">{cameras.length}<small> / {cameras.length}</small></div><div className="ml">Cameras online</div></div>
        <div className="metric"><div className="mv" style={{ color: 'var(--online)' }}>{cameras.filter((c) => c.streamUrl).length}</div><div className="ml">Live streams</div></div>
        <div className="metric"><div className="mv" style={{ color: 'var(--accent)' }}>{cameras.filter((c) => c.proxied).length}</div><div className="ml">Relayed via proxy</div></div>
        <div className="metric"><div className="mv" style={{ color: 'var(--online)' }}>100%</div><div className="ml">System health</div></div>
      </div>
    </section>
  );
}

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

export function LivePage() {
  const { cameras } = useApp();
  const [selected, setSelected] = useState(0);
  const [wall, setWall] = useState([0, 1, 2, 3]);
  const [wizard, setWizard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width:720px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // On phones, show every camera in one scrollable column; on desktop, a 2×2 wall.
  const shown = isMobile ? cameras.map((_, i) => i) : wall;

  const select = (ci: number) => {
    setSelected(ci);
    setWall((w) => (w.includes(ci) ? w : [ci, ...w.slice(1)]));
  };

  return (
    <section>
      {wizard && <AddCameraWizard onClose={() => setWizard(false)} />}
      <ViewHead
        title="Live Wall"
        subtitle={`North Campus · ${shown.length} of ${cameras.length} cameras · analytics running on-device`}
        actions={
          <>
            <button className="btn" onClick={() => setWizard(true)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 5v14M5 12h14" /></svg>Add camera</button>
            <button className="btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>Layout · 2×2</button>
            <button className="btn primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="currentColor" /></svg>Snapshot all</button>
          </>
        }
      />

      <div className="live-grid">
        <div className="wall">
          {shown.map((ci, slot) => {
            const cam = cameras[ci];
            if (!cam) return null;
            const isSel = ci === selected;
            return (
              <div key={slot} className={`cam${isSel ? ' sel' : ''}`} onClick={() => select(ci)}>
                <CameraVideo camera={cam} index={ci} />
                <div className="scanline" />
                <div className="cam-top">
                  <div className="cam-name">{cam.n}<span className="id">{cam.id} · {cam.loc}</span></div>
                  {isSel ? <Chip kind="rec">REC</Chip> : <Chip kind="online">Live</Chip>}
                </div>
                {cam.people > 0 && <div className="count-badge"><b>{cam.people}</b>people</div>}
                <Boxes cam={cam} slot={slot} />
                <div className="cam-bot">
                  <TimeStamp />
                  {cam.face ? <Chip kind="ai">Face ID</Chip> : <Chip kind="motion" style={{ opacity: 0.85 }}>Motion</Chip>}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="cam-panel">
          <div className="panel-block" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <h4>Cameras · {cameras.length}</h4>
            <div className="camlist">
              {cameras.map((cam, i) => (
                <div key={cam.id} className={`camlist-item${i === selected ? ' sel' : ''}`} onClick={() => select(i)}>
                  <div className="thumb"><Scene index={i} /></div>
                  <div className="nm">{cam.n}<span>{cam.id}</span></div>
                  {i === selected ? <Chip kind="rec" style={{ padding: '2px 6px' }} /> : <Chip kind="online" style={{ padding: '2px 6px' }} />}
                </div>
              ))}
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
        <div className="metric"><div className="mv" style={{ color: 'var(--motion)' }}>3</div><div className="ml">Active motion zones</div></div>
        <div className="metric"><div className="mv" style={{ color: 'var(--ai)' }}>7</div><div className="ml">People detected now</div></div>
        <div className="metric"><div className="mv" style={{ color: 'var(--online)' }}>98%</div><div className="ml">System health</div></div>
      </div>
    </section>
  );
}

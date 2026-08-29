import { useState } from 'react';
import { Toggle } from '../components/common';

interface Drive { name: string; used: string; cap: string; segs: [string, number][]; }
interface Store { title: string; note: string; drives: Drive[]; foot: string; }

const STORE: Record<'device' | 'cloud', Store> = {
  device: {
    title: 'Local Array · NVR-01', note: 'RAID-6 · 8 × 8TB · hot-swap',
    drives: [
      { name: 'Volume 1 · Recordings', used: '38.2 TB', cap: '64 TB', segs: [['var(--accent)', 42], ['var(--motion)', 14], ['var(--ai)', 6]] },
      { name: 'Volume 2 · Events & AI', used: '11.4 TB', cap: '32 TB', segs: [['var(--ai)', 22], ['var(--accent)', 13]] },
      { name: 'Volume 3 · Evidence (locked)', used: '4.1 TB', cap: '16 TB', segs: [['var(--alert)', 26]] },
    ],
    foot: 'Est. 30 days continuous at current bitrate',
  },
  cloud: {
    title: 'Aperture Cloud · US-East', note: 'Zero-knowledge · geo-redundant',
    drives: [
      { name: 'Warm tier · last 30 days', used: '2.8 TB', cap: 'Elastic', segs: [['var(--accent)', 34]] },
      { name: 'Cold archive · 90+ days', used: '14.6 TB', cap: 'Elastic', segs: [['var(--faint)', 58]] },
      { name: 'Sync queue', used: '62 GB', cap: 'Uploading', segs: [['var(--motion)', 8]] },
    ],
    foot: 'Uploads throttled to 20 Mbps · encrypted before leaving device',
  },
};

export function StoragePage() {
  const [which, setWhich] = useState<'device' | 'cloud'>('device');
  const [ret1, setRet1] = useState(30);
  const [ret2, setRet2] = useState(90);
  const s = STORE[which];

  return (
    <section>
      <div className="vhead">
        <div><h2>Storage &amp; Encryption</h2><p>Hybrid retention · AES-256 at rest, TLS 1.3 in transit</p></div>
        <div className="seg-toggle">
          <button className={which === 'device' ? 'on' : ''} onClick={() => setWhich('device')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h.01M7 12h.01M7 16h.01" /></svg>On-device</button>
          <button className={which === 'cloud' ? 'on' : ''} onClick={() => setWhich('cloud')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 18a4 4 0 010-8 5 5 0 019.6-1.5A3.5 3.5 0 0118 18z" /></svg>Cloud</button>
        </div>
      </div>

      <div className="col-2-a">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div><h3 style={{ fontSize: 15 }}>{s.title}</h3><p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 3 }} className="mono">{s.note}</p></div>
            <span className="chip online"><span className="d" />Healthy</span>
          </div>
          {s.drives.map((d) => (
            <div key={d.name} className="drive">
              <div className="drive-head">
                <span className="dn"><svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--muted)" strokeWidth={1.8}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h.01M7 15h6" /></svg>{d.name}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{d.used} / {d.cap}</span>
              </div>
              <div className="cap-bar">{d.segs.map((x, i) => <i key={i} style={{ background: x[0], width: `${x[1]}%` }} />)}</div>
              <div className="cap-legend">{d.segs.map((x, i) => <span key={i}><b style={{ background: x[0] }} />{x[1]}%</span>)}<span style={{ marginLeft: 'auto', color: 'var(--faint)' }}>free</span></div>
            </div>
          ))}
          <p style={{ color: 'var(--faint)', fontSize: 12, marginTop: 4 }} className="mono">{s.foot}</p>
        </div>

        <div className="enc-panel">
          <div className="row" style={{ gap: 13, marginBottom: 16 }}>
            <div className="enc-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /><circle cx="12" cy="15.5" r="1.5" fill="currentColor" stroke="none" /></svg></div>
            <div><h3 style={{ fontSize: 15 }}>Encryption</h3><p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 2 }}>All footage protected end-to-end</p></div>
          </div>
          <div className="setting"><div className="st"><div className="t">AES-256 at rest</div><div className="d">Recordings encrypted on disk</div></div><Toggle on /></div>
          <div className="setting"><div className="st"><div className="t">TLS 1.3 in transit</div><div className="d">Streams &amp; uploads over encrypted channel</div></div><Toggle on /></div>
          <div className="setting"><div className="st"><div className="t">Customer-managed keys</div><div className="d">Rotate every 90 days · KMS-backed</div></div><Toggle on /></div>
          <div className="setting"><div className="st"><div className="t">Zero-knowledge cloud</div><div className="d">Provider cannot decrypt footage</div></div><Toggle /></div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 14, padding: 11, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            <span className="chip online"><span className="d" />Keys healthy</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>next rotation · 63d</span>
          </div>
          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Manage keys</button>
        </div>
      </div>

      <div className="cardp" style={{ marginTop: 16 }}>
        <h3>Retention Policy</h3>
        <p className="sub">How long each stream type is kept before automatic purge</p>
        <div className="setting"><div className="st"><div className="t">Continuous recording</div><div className="d">All cameras, 24/7</div></div><span className="mono" style={{ color: 'var(--accent)', width: 64, textAlign: 'right' }}>{ret1} days</span><input className="slider" type="range" min={7} max={90} value={ret1} onChange={(e) => setRet1(+e.target.value)} /></div>
        <div className="setting"><div className="st"><div className="t">Motion &amp; AI events</div><div className="d">Clips with detections</div></div><span className="mono" style={{ color: 'var(--accent)', width: 64, textAlign: 'right' }}>{ret2} days</span><input className="slider" type="range" min={30} max={365} value={ret2} onChange={(e) => setRet2(+e.target.value)} /></div>
        <div className="setting"><div className="st"><div className="t">Flagged / evidence</div><div className="d">Locked, exempt from purge</div></div><span className="chip ai"><span className="d" style={{ background: 'var(--ai)' }} />Indefinite</span></div>
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { sceneStyle } from '../data/cameras';
import { Seg, TimeStamp, Toggle } from '../components/common';
import { useApp } from '../context/AppContext';

type CTab = 'image' | 'stream' | 'network' | 'rec';
interface Img { brightness: number; contrast: number; saturate: number; sharp: number; focus: number; hue: number; }
const DEFAULTS: Img = { brightness: 100, contrast: 100, saturate: 100, sharp: 50, focus: 100, hue: 0 };

const CTABS: { key: CTab; label: string; icon: ReactNode }[] = [
  { key: 'image', label: 'Image', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 000 18M12 8v8M8 12h8" /></> },
  { key: 'stream', label: 'Stream', icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  { key: 'network', label: 'Network', icon: <><rect x="2" y="14" width="6" height="7" rx="1" /><rect x="16" y="14" width="6" height="7" rx="1" /><rect x="9" y="3" width="6" height="7" rx="1" /><path d="M12 10v4M5 14v-2h14v2" /></> },
  { key: 'rec', label: 'Recording', icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" /></> },
];

const SLIDERS: { key: keyof Img; label: string; min: number; max: number }[] = [
  { key: 'brightness', label: 'Brightness', min: 50, max: 150 },
  { key: 'contrast', label: 'Contrast', min: 50, max: 150 },
  { key: 'saturate', label: 'Saturation', min: 0, max: 200 },
  { key: 'sharp', label: 'Sharpness', min: 0, max: 100 },
  { key: 'focus', label: 'Focus', min: 0, max: 100 },
  { key: 'hue', label: 'Hue', min: -30, max: 30 },
];

export function CameraSettingsPage() {
  const { cameras } = useApp();
  const [tab, setTab] = useState<CTab>('image');
  const [ci, setCi] = useState(0);
  const [img, setImg] = useState<Img>(DEFAULTS);
  const [name, setName] = useState(cameras[0]?.n ?? '');
  const cam = cameras[ci] ?? cameras[0];

  const filter = useMemo(() => {
    const blur = ((100 - img.focus) / 100) * 3 + ((100 - img.sharp) / 100) * 0.6;
    return `brightness(${img.brightness / 100}) contrast(${img.contrast / 100}) saturate(${img.saturate / 100}) hue-rotate(${img.hue}deg)${blur > 0.05 ? ` blur(${blur.toFixed(2)}px)` : ''}`;
  }, [img]);

  const selectCam = (i: number) => { setCi(i); setName(cameras[i].n); setImg(DEFAULTS); };
  const previewScene: CSSProperties = { ...sceneStyle(ci), filter, transition: 'filter .1s' };

  return (
    <section>
      <div className="vhead">
        <div><h2>Camera Settings</h2><p>Image · stream · network · recording — per camera</p></div>
        <div className="toolbar">
          <button className="btn" onClick={() => setImg(DEFAULTS)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5" /></svg>Reset</button>
          <button className="btn primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg>Save &amp; apply</button>
        </div>
      </div>
      <div className="cfg-wrap">
        <div>
          <div className="cfg-preview">
            <div className="scene" style={previewScene} />
            <div className="scanline" />
            <div className="cam-top"><div className="cam-name">{name} <span className="id">{cam.id} · Live preview</span></div><span className="chip online"><span className="d" />Preview</span></div>
            <div className="cam-bot"><TimeStamp /><span className="ts" style={{ color: 'var(--faint)' }}>B{img.brightness} · C{img.contrast} · S{img.saturate}</span></div>
          </div>

          <div className="subtabs" style={{ marginTop: 14, marginBottom: 14 }}>
            {CTABS.map((t) => (
              <button key={t.key} className={`subtab${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{t.icon}</svg>{t.label}
              </button>
            ))}
          </div>

          {tab === 'image' && (
            <div className="card" style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}><h4 className="eyebrow">Image · {cam.id}</h4><span className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>applies to preview</span></div>
              {SLIDERS.map((s) => (
                <div key={s.key} className="ctrl">
                  <span className="cl">{s.label}</span>
                  <input type="range" className="slider" min={s.min} max={s.max} value={img[s.key]} onChange={(e) => setImg((v) => ({ ...v, [s.key]: +e.target.value }))} />
                  <span className="cv">{img[s.key]}</span>
                </div>
              ))}
              <div className="row" style={{ gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                <div className="row" style={{ gap: 8 }}><Toggle on /><span style={{ fontSize: 12.5, color: 'var(--muted)' }}>WDR</span></div>
                <div className="row" style={{ gap: 8 }}><Toggle on /><span style={{ fontSize: 12.5, color: 'var(--muted)' }}>IR night mode</span></div>
                <div className="row" style={{ gap: 8 }}><Toggle /><span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Flip 180°</span></div>
              </div>
            </div>
          )}

          {tab === 'stream' && (
            <>
              <div className="card" style={{ padding: 16 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Main stream · recording &amp; full-screen</h4>
                <div className="field row2"><div><label>Resolution</label><input type="text" defaultValue="3840×2160 (4K)" /></div><div><label>Frame rate</label><input type="text" defaultValue="25 fps" /></div></div>
                <div className="field row2"><div><label>Codec</label><input type="text" defaultValue="H.265 (HEVC)" /></div><div><label>Bitrate</label><input type="text" defaultValue="8192 kbps · VBR" /></div></div>
                <div className="ctrl"><span className="cl">Quality</span><input type="range" className="slider" min={1} max={6} defaultValue={5} /><span className="cv">High</span></div>
                <div className="field row2" style={{ marginTop: 12 }}><div><label>GOP / I-frame</label><input type="text" defaultValue="50" /></div><div><label>Audio</label><input type="text" defaultValue="AAC · on" /></div></div>
              </div>
              <div className="card" style={{ padding: 16, marginTop: 12 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Sub stream · mobile &amp; multi-view</h4>
                <div className="field row2"><div><label>Resolution</label><input type="text" defaultValue="640×360" /></div><div><label>Frame rate</label><input type="text" defaultValue="15 fps" /></div></div>
                <div className="field row2"><div><label>Codec</label><input type="text" defaultValue="H.264" /></div><div><label>Bitrate</label><input type="text" defaultValue="512 kbps · CBR" /></div></div>
                <div className="setting"><div className="st"><div className="t">Smart codec (H.265+)</div><div className="d">Lower bitrate on static scenes</div></div><Toggle on /></div>
              </div>
            </>
          )}

          {tab === 'network' && (
            <>
              <div className="card" style={{ padding: 16 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}><h4 className="eyebrow">Connection</h4><span className="chip online"><span className="d" />Reachable · 2ms</span></div>
                <div className="field"><label>Addressing</label><Seg options={['Static IP', 'DHCP']} /></div>
                <div className="field row2"><div><label>IP address</label><input type="text" defaultValue="10.20.4.11" /></div><div><label>Subnet mask</label><input type="text" defaultValue="255.255.255.0" /></div></div>
                <div className="field row2"><div><label>Gateway</label><input type="text" defaultValue="10.20.4.1" /></div><div><label>DNS</label><input type="text" defaultValue="10.20.0.2" /></div></div>
                <div className="field row2"><div><label>MAC</label><input type="text" defaultValue="B4:2E:99:1C:0A:44" /></div><div><label>ONVIF port</label><input type="text" defaultValue="80" /></div></div>
              </div>
              <div className="card" style={{ padding: 16, marginTop: 12 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Protocols &amp; ports</h4>
                <div className="kv"><span className="k">RTSP</span><span className="v">rtsp://10.20.4.11:554/main</span></div>
                <div className="kv"><span className="k">HTTP / HTTPS</span><span className="v">80 / 443</span></div>
                <div className="kv"><span className="k">ONVIF profile</span><span className="v">S · G · T</span></div>
                <div className="setting"><div className="st"><div className="t">ONVIF discovery</div><div className="d">Auto-detect on the LAN</div></div><Toggle on /></div>
                <div className="setting"><div className="st"><div className="t">HTTPS only</div><div className="d">Reject plain HTTP</div></div><Toggle on /></div>
                <div className="setting"><div className="st"><div className="t">802.1X / NAC</div><div className="d">Port authentication</div></div><Toggle /></div>
              </div>
              <div className="enc-panel" style={{ marginTop: 12 }}>
                <div className="row" style={{ gap: 13, marginBottom: 14 }}>
                  <div className="enc-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 18a4 4 0 010-8 5 5 0 019.6-1.5A3.5 3.5 0 0118 18zM12 11v5M9.5 13.5L12 11l2.5 2.5" /></svg></div>
                  <div><h3 style={{ fontSize: 14 }}>Remote Access</h3><p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>Reach this camera off-site</p></div>
                </div>
                <div className="setting"><div className="st"><div className="t">Cloud P2P relay</div><div className="d">No port-forwarding needed · UID 7F2K-90AC-11B</div></div><Toggle on /></div>
                <div className="setting"><div className="st"><div className="t">DDNS</div><div className="d">northcampus.aperture-cam.net</div></div><Toggle on /></div>
                <div className="setting"><div className="st"><div className="t">WebRTC low-latency</div><div className="d">STUN/TURN relay for live view</div></div><Toggle on /></div>
                <div className="setting"><div className="st"><div className="t">Site-to-site VPN</div><div className="d">WireGuard · always-on tunnel</div></div><Toggle /></div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 12, padding: 11, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pair mobile app</span>
                  <span style={{ width: 44, height: 44, borderRadius: 6, background: '#fff', display: 'grid', placeItems: 'center' }}><svg viewBox="0 0 24 24" width={34} height={34} fill="#0a0e13"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3zm0 3h2v3h-3v-2h1zm3 0h-1v2h1v-2zm0 3h-3v2h3v-2z" /></svg></span>
                </div>
              </div>
            </>
          )}

          {tab === 'rec' && (
            <>
              <div className="card" style={{ padding: 16 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Recording mode</h4>
                <div className="field"><Seg options={['Continuous', 'Motion', 'Event', 'Schedule']} /></div>
                <div className="setting"><div className="st"><div className="t">Pre-record buffer</div><div className="d">Captured before an event</div></div><span className="mono" style={{ color: 'var(--accent)' }}>8s</span></div>
                <div className="setting"><div className="st"><div className="t">Post-record</div><div className="d">After event ends</div></div><span className="mono" style={{ color: 'var(--accent)' }}>15s</span></div>
                <div className="setting"><div className="st"><div className="t">Retention</div><div className="d">Before auto-purge</div></div><span className="mono" style={{ color: 'var(--accent)' }}>30 days</span></div>
              </div>
              <div className="card" style={{ padding: 16, marginTop: 12 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Motion &amp; detection</h4>
                <div className="ctrl"><span className="cl">Sensitivity</span><input type="range" className="slider" min={0} max={100} defaultValue={65} /><span className="cv">65</span></div>
                <div className="setting"><div className="st"><div className="t">Human/vehicle filter</div><div className="d">Ignore leaves, rain, small animals</div></div><Toggle on /></div>
                <div className="setting"><div className="st"><div className="t">Detection zones</div><div className="d">3 areas masked</div></div><button className="btn" style={{ padding: '5px 10px' }}>Edit zones</button></div>
                <div className="setting"><div className="st"><div className="t">Audio detection</div><div className="d">Glass-break, raised voices</div></div><Toggle /></div>
              </div>
            </>
          )}
        </div>

        <aside>
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <h4 className="eyebrow" style={{ marginBottom: 14 }}>Select camera</h4>
            <div className="camlist" style={{ maxHeight: 200, overflow: 'auto' }}>
              {cameras.map((c, i) => (
                <div key={c.id} className={`camlist-item${i === ci ? ' sel' : ''}`} onClick={() => selectCam(i)}>
                  <div className="thumb"><div className="scene" style={sceneStyle(i)} /></div>
                  <div className="nm">{c.n}<span>{c.id}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <h4 className="eyebrow" style={{ marginBottom: 14 }}>Nomenclature</h4>
            <div className="field"><label>Display name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field row2"><div><label>Camera number</label><input type="text" value={cam.id} readOnly /></div><div><label>Channel</label><input type="text" defaultValue="CH-01" /></div></div>
            <div className="field"><label>Group / Zone</label><Seg options={['Perimeter', 'Interior', 'Restricted']} /></div>
            <div className="field"><label>Location label</label><input type="text" defaultValue="North Campus · Ground · West Door" /></div>
            <p style={{ fontSize: 11.5, color: 'var(--faint)', margin: '2px 0 0', fontFamily: 'var(--mono)' }}>Naming template: {'{Zone}-{Number} · {Location}'}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

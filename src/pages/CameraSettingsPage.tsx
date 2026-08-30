import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { sceneStyle } from '../data/cameras';
import { Seg, TimeStamp, Toggle } from '../components/common';
import { CameraVideo } from '../components/CameraVideo';
import { useApp } from '../context/AppContext';
import { DEFAULT_IMG, imgFilterCss, type ImgAdjust } from '../lib/img';

type CTab = 'image' | 'stream' | 'network' | 'rec';
type Group = 'Perimeter' | 'Interior' | 'Restricted';

const CTABS: { key: CTab; label: string; icon: ReactNode }[] = [
  { key: 'image', label: 'Image', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 000 18M12 8v8M8 12h8" /></> },
  { key: 'stream', label: 'Stream', icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  { key: 'network', label: 'Network', icon: <><rect x="2" y="14" width="6" height="7" rx="1" /><rect x="16" y="14" width="6" height="7" rx="1" /><rect x="9" y="3" width="6" height="7" rx="1" /><path d="M12 10v4M5 14v-2h14v2" /></> },
  { key: 'rec', label: 'Recording', icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" /></> },
];

const SLIDERS: { key: keyof ImgAdjust; label: string; min: number; max: number }[] = [
  { key: 'brightness', label: 'Brightness', min: 50, max: 150 },
  { key: 'contrast', label: 'Contrast', min: 50, max: 150 },
  { key: 'saturate', label: 'Saturation', min: 0, max: 200 },
  { key: 'sharp', label: 'Sharpness', min: 0, max: 100 },
  { key: 'focus', label: 'Focus', min: 0, max: 100 },
  { key: 'hue', label: 'Hue', min: -30, max: 30 },
];

const POLL: { label: string; ms: number }[] = [
  { label: '1 fps', ms: 1000 }, { label: '2 fps', ms: 500 }, { label: '4 fps', ms: 250 },
];

function fieldDefaults(): Record<string, string> {
  return {
    res: '3840×2160 (4K)', fps: '25 fps', codec: 'H.265 (HEVC)', bitrate: '8192 kbps · VBR', gop: '50', audio: 'AAC · on',
    subRes: '640×360', subFps: '15 fps', subCodec: 'H.264', subBitrate: '512 kbps · CBR',
    ip: '10.20.4.11', subnet: '255.255.255.0', gateway: '10.20.4.1', dns: '10.20.0.2', mac: 'B4:2E:99:1C:0A:44', onvifPort: '80',
    channel: 'CH-01', location: 'North Campus · Ground · West Door',
  };
}

interface Work { name: string; group: Group; refreshMs: number; img: ImgAdjust; fields: Record<string, string> }

export function CameraSettingsPage() {
  const { cameras, overrides, saveOverride } = useApp();
  const [tab, setTab] = useState<CTab>('image');
  const [ci, setCi] = useState(0);
  const [saved, setSaved] = useState(false);
  const cam = cameras[ci] ?? cameras[0];

  const seed = (id: string, camName: string, camRefresh?: number): Work => {
    const o = overrides[id] ?? {};
    return {
      name: o.name ?? camName,
      group: (o.group as Group) ?? 'Perimeter',
      refreshMs: o.refreshMs ?? camRefresh ?? 1000,
      img: o.img ?? DEFAULT_IMG,
      fields: { ...fieldDefaults(), ...(o.fields ?? {}) },
    };
  };

  const [work, setWork] = useState<Work>(() => seed(cam.id, cam.n, cam.refreshMs));

  // Reseed when the selected camera changes.
  useEffect(() => { setWork(seed(cam.id, cam.n, cam.refreshMs)); setSaved(false); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [ci]);

  const previewStyle: CSSProperties = useMemo(() => ({ ...sceneStyle(ci), filter: imgFilterCss(work.img), transition: 'filter .1s' }), [ci, work.img]);
  const setField = (k: string, v: string) => setWork((w) => ({ ...w, fields: { ...w.fields, [k]: v } }));
  const setImg = (k: keyof ImgAdjust, v: number) => setWork((w) => ({ ...w, img: { ...w.img, [k]: v } }));

  const save = () => { saveOverride(cam.id, { name: work.name, group: work.group, refreshMs: work.refreshMs, img: work.img, fields: work.fields }); setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  const reset = () => setWork({ name: cam.n, group: 'Perimeter', refreshMs: 1000, img: DEFAULT_IMG, fields: fieldDefaults() });

  const hasLive = !!cam.streamUrl;

  return (
    <section>
      <div className="vhead">
        <div><h2>Camera Settings</h2><p>Image · stream · network · recording — changes save per camera</p></div>
        <div className="toolbar">
          <button className="btn" onClick={reset}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5" /></svg>Reset</button>
          <button className="btn primary" onClick={save}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg>{saved ? 'Saved ✓' : 'Save & apply'}</button>
        </div>
      </div>
      <div className="cfg-wrap">
        <div>
          <div className="cfg-preview">
            {hasLive
              ? <CameraVideo camera={{ ...cam, imgFilter: imgFilterCss(work.img) }} index={ci} />
              : <div className="scene" style={previewStyle} />}
            <div className="scanline" />
            <div className="cam-top"><div className="cam-name">{work.name} <span className="id">{cam.id} · Live preview</span></div><span className="chip online"><span className="d" />Preview</span></div>
            <div className="cam-bot"><TimeStamp /><span className="ts" style={{ color: 'var(--faint)' }}>B{work.img.brightness} · C{work.img.contrast} · S{work.img.saturate}</span></div>
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
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}><h4 className="eyebrow">Image · {cam.id}</h4><span className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>applies to the live feed</span></div>
              {SLIDERS.map((s) => (
                <div key={s.key} className="ctrl">
                  <span className="cl">{s.label}</span>
                  <input type="range" className="slider" min={s.min} max={s.max} value={work.img[s.key]} onChange={(e) => setImg(s.key, +e.target.value)} />
                  <span className="cv">{work.img[s.key]}</span>
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
              {hasLive && (
                <div className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <h4 className="eyebrow" style={{ marginBottom: 12 }}>Live poll rate <span style={{ color: 'var(--faint)', textTransform: 'none', letterSpacing: 0 }}>· snapshot refresh</span></h4>
                  <div className="seg-sm">
                    {POLL.map((p) => <button key={p.ms} className={work.refreshMs === p.ms ? 'on' : ''} onClick={() => setWork((w) => ({ ...w, refreshMs: p.ms }))}>{p.label}</button>)}
                  </div>
                </div>
              )}
              <div className="card" style={{ padding: 16 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Main stream · recording &amp; full-screen</h4>
                <div className="field row2"><div><label>Resolution</label><input type="text" value={work.fields.res} onChange={(e) => setField('res', e.target.value)} /></div><div><label>Frame rate</label><input type="text" value={work.fields.fps} onChange={(e) => setField('fps', e.target.value)} /></div></div>
                <div className="field row2"><div><label>Codec</label><input type="text" value={work.fields.codec} onChange={(e) => setField('codec', e.target.value)} /></div><div><label>Bitrate</label><input type="text" value={work.fields.bitrate} onChange={(e) => setField('bitrate', e.target.value)} /></div></div>
                <div className="field row2"><div><label>GOP / I-frame</label><input type="text" value={work.fields.gop} onChange={(e) => setField('gop', e.target.value)} /></div><div><label>Audio</label><input type="text" value={work.fields.audio} onChange={(e) => setField('audio', e.target.value)} /></div></div>
              </div>
              <div className="card" style={{ padding: 16, marginTop: 12 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Sub stream · mobile &amp; multi-view</h4>
                <div className="field row2"><div><label>Resolution</label><input type="text" value={work.fields.subRes} onChange={(e) => setField('subRes', e.target.value)} /></div><div><label>Frame rate</label><input type="text" value={work.fields.subFps} onChange={(e) => setField('subFps', e.target.value)} /></div></div>
                <div className="field row2"><div><label>Codec</label><input type="text" value={work.fields.subCodec} onChange={(e) => setField('subCodec', e.target.value)} /></div><div><label>Bitrate</label><input type="text" value={work.fields.subBitrate} onChange={(e) => setField('subBitrate', e.target.value)} /></div></div>
                <div className="setting"><div className="st"><div className="t">Smart codec (H.265+)</div><div className="d">Lower bitrate on static scenes</div></div><Toggle on /></div>
              </div>
            </>
          )}

          {tab === 'network' && (
            <>
              <div className="card" style={{ padding: 16 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}><h4 className="eyebrow">Connection</h4><span className="chip online"><span className="d" />Reachable · 2ms</span></div>
                <div className="field"><label>Addressing</label><Seg options={['Static IP', 'DHCP']} /></div>
                <div className="field row2"><div><label>IP address</label><input type="text" value={work.fields.ip} onChange={(e) => setField('ip', e.target.value)} /></div><div><label>Subnet mask</label><input type="text" value={work.fields.subnet} onChange={(e) => setField('subnet', e.target.value)} /></div></div>
                <div className="field row2"><div><label>Gateway</label><input type="text" value={work.fields.gateway} onChange={(e) => setField('gateway', e.target.value)} /></div><div><label>DNS</label><input type="text" value={work.fields.dns} onChange={(e) => setField('dns', e.target.value)} /></div></div>
                <div className="field row2"><div><label>MAC</label><input type="text" value={work.fields.mac} onChange={(e) => setField('mac', e.target.value)} /></div><div><label>ONVIF port</label><input type="text" value={work.fields.onvifPort} onChange={(e) => setField('onvifPort', e.target.value)} /></div></div>
              </div>
              <div className="card" style={{ padding: 16, marginTop: 12 }}>
                <h4 className="eyebrow" style={{ marginBottom: 14 }}>Protocols &amp; ports</h4>
                <div className="kv"><span className="k">RTSP</span><span className="v">rtsp://{work.fields.ip}:554/main</span></div>
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
                <div className="setting"><div className="st"><div className="t">Audio detection</div><div className="d">Glass-break, raised voices</div></div><Toggle /></div>
              </div>
            </>
          )}
        </div>

        <aside>
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <h4 className="eyebrow" style={{ marginBottom: 14 }}>Select camera</h4>
            <div className="camlist" style={{ maxHeight: 220, overflow: 'auto' }}>
              {cameras.map((c, i) => (
                <div key={c.id} className={`camlist-item${i === ci ? ' sel' : ''}`} onClick={() => setCi(i)}>
                  <div className="thumb"><div className="scene" style={sceneStyle(i)} /></div>
                  <div className="nm">{c.n}<span>{c.id}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <h4 className="eyebrow" style={{ marginBottom: 14 }}>Nomenclature</h4>
            <div className="field"><label>Display name</label><input type="text" value={work.name} onChange={(e) => setWork((w) => ({ ...w, name: e.target.value }))} /></div>
            <div className="field row2"><div><label>Camera number</label><input type="text" value={cam.id} readOnly /></div><div><label>Channel</label><input type="text" value={work.fields.channel} onChange={(e) => setField('channel', e.target.value)} /></div></div>
            <div className="field"><label>Group / Zone</label>
              <div className="seg-sm">
                {(['Perimeter', 'Interior', 'Restricted'] as Group[]).map((g) => (
                  <button key={g} className={work.group === g ? 'on' : ''} onClick={() => setWork((w) => ({ ...w, group: g }))}>{g}</button>
                ))}
              </div>
            </div>
            <div className="field"><label>Location label</label><input type="text" value={work.fields.location} onChange={(e) => setField('location', e.target.value)} /></div>
            <p style={{ fontSize: 11.5, color: 'var(--faint)', margin: '2px 0 0', fontFamily: 'var(--mono)' }}>Changes are saved to this browser and applied to the live wall.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

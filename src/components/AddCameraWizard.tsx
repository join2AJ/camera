import { useState } from 'react';
import type { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import type { StreamType } from '../data/cameras';

type Group = 'Perimeter' | 'Interior' | 'Restricted';
type Source = 'onvif' | 'rtsp' | 'manual';

const SOURCES: { key: Source; title: string; sub: string; icon: ReactNode }[] = [
  { key: 'onvif', title: 'ONVIF auto-discovery', sub: 'Scan the LAN for compatible cameras', icon: <><circle cx="12" cy="12" r="3" /><path d="M8 12a4 4 0 018 0M5 12a7 7 0 0114 0" /></> },
  { key: 'rtsp', title: 'RTSP / IP address', sub: 'Add a stream by URL', icon: <><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M6 10v4M10 10v4M14 10v4M18 10v4" /></> },
  { key: 'manual', title: 'Manual entry', sub: 'Placeholder — configure the stream later', icon: <path d="M12 5v14M5 12h14" /> },
];

const STREAMS: { key: StreamType | 'none'; title: string; sub: string }[] = [
  { key: 'hls', title: 'HLS', sub: 'Recorded / higher-latency live (.m3u8)' },
  { key: 'webrtc', title: 'WebRTC (WHEP)', sub: 'Sub-second live view' },
  { key: 'none', title: 'No stream yet', sub: 'Add the camera, wire video later' },
];

export function AddCameraWizard({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [source, setSource] = useState<Source>('rtsp');
  const [name, setName] = useState('');
  const [group, setGroup] = useState<Group>('Perimeter');
  const [ip, setIp] = useState('10.20.4.');
  const [streamKind, setStreamKind] = useState<StreamType | 'none'>('none');
  const [streamUrl, setStreamUrl] = useState('');

  const canNext =
    (step === 0) ||
    (step === 1 && name.trim().length > 0) ||
    (step === 2) ||
    step === 3;

  const finish = async () => {
    setSaving(true);
    await app.addCamera({
      n: name.trim() || 'New Camera',
      loc: `${group} · ${source === 'rtsp' ? 'IP' : source === 'onvif' ? 'ONVIF' : 'Manual'}`,
      streamType: streamKind === 'none' ? undefined : streamKind,
      streamUrl: streamKind === 'none' ? undefined : streamUrl.trim() || undefined,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Add camera</h3>
          <button className="x" aria-label="Close" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <div className="steps">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`step-dot${i === step ? ' on' : i < step ? ' done' : ''}`} />)}
        </div>
        <div className="step-label">Step {step + 1} of 4 · {['Source', 'Details', 'Stream', 'Confirm'][step]}</div>

        <div className="modal-body">
          {step === 0 && (
            <div className="pick">
              {SOURCES.map((s) => (
                <button key={s.key} className={`pick-opt${source === s.key ? ' sel' : ''}`} onClick={() => setSource(s.key)}>
                  <span className="pk-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>{s.icon}</svg></span>
                  <span className="pk-t"><span className="pk-title">{s.title}</span><span className="pk-sub">{s.sub}</span></span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="field"><label>Display name</label><input type="text" autoFocus placeholder="e.g. East Gate" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label>Group / Zone</label>
                <div className="seg-sm">
                  {(['Perimeter', 'Interior', 'Restricted'] as Group[]).map((g) => (
                    <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>{g}</button>
                  ))}
                </div>
              </div>
              {source !== 'manual' && (
                <div className="field"><label>{source === 'onvif' ? 'Discovered address' : 'IP / host'}</label><input type="text" value={ip} onChange={(e) => setIp(e.target.value)} /></div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="pick">
                {STREAMS.map((s) => (
                  <button key={s.key} className={`pick-opt${streamKind === s.key ? ' sel' : ''}`} onClick={() => setStreamKind(s.key)}>
                    <span className="pk-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 6h16M4 12h16M4 18h10" /></svg></span>
                    <span className="pk-t"><span className="pk-title">{s.title}</span><span className="pk-sub">{s.sub}</span></span>
                  </button>
                ))}
              </div>
              {streamKind !== 'none' && (
                <div className="field" style={{ marginTop: 14 }}>
                  <label>{streamKind === 'hls' ? 'HLS URL (.m3u8)' : 'WHEP endpoint URL'}</label>
                  <input type="text" placeholder={streamKind === 'hls' ? 'https://…/stream.m3u8' : 'https://…/whep'} value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="confirm-row"><span className="k">Name</span><span className="v">{name.trim() || 'New Camera'}</span></div>
              <div className="confirm-row"><span className="k">Group</span><span className="v">{group}</span></div>
              <div className="confirm-row"><span className="k">Source</span><span className="v">{source.toUpperCase()}</span></div>
              {source !== 'manual' && <div className="confirm-row"><span className="k">Address</span><span className="v">{ip}</span></div>}
              <div className="confirm-row"><span className="k">Stream</span><span className="v">{streamKind === 'none' ? 'none' : streamKind.toUpperCase()}</span></div>
              {streamKind !== 'none' && streamUrl && <div className="confirm-row"><span className="k">URL</span><span className="v" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{streamUrl}</span></div>}
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}>{step === 0 ? 'Cancel' : 'Back'}</button>
          {step < 3
            ? <button className="btn primary" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Next</button>
            : <button className="btn primary" disabled={saving} onClick={finish}>{saving ? 'Adding…' : 'Add camera'}</button>}
        </div>
      </div>
    </div>
  );
}

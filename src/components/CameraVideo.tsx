import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Camera } from '../data/cameras';
import { Scene } from './common';
import { useApp } from '../context/AppContext';

const FILL: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#05080c' };

/**
 * Route a camera URL through the Netlify proxy when needed:
 * - `force` (camera.proxied): host not reachable from the client directly.
 * - HTTP URL on an HTTPS page: browsers block mixed content otherwise.
 */
function resolveUrl(url: string, force = false): string {
  const https = typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (force || (https && url.startsWith('http:'))) return `/camproxy?url=${encodeURIComponent(url)}`;
  return url;
}

export function CameraVideo({ camera, index, style, muted = true }: { camera: Camera; index: number; style?: CSSProperties; muted?: boolean }) {
  const { reportCameraStatus } = useApp();
  if (!camera.streamUrl) return <Scene index={index} style={style} />;
  const force = !!camera.proxied;
  const filter = camera.imgFilter || undefined;
  const onStatus = (s: 'ok' | 'lost') => reportCameraStatus(camera.id, camera.n, s);
  if (camera.streamType === 'mjpeg') return <ImageStream url={resolveUrl(camera.streamUrl, force)} filter={filter} style={style} />;
  if (camera.streamType === 'snapshot') return <ImageStream url={resolveUrl(camera.streamUrl, force)} refreshMs={camera.refreshMs ?? 1000} filter={filter} style={style} onStatus={onStatus} />;
  return <VideoStream camera={camera} style={style} muted={muted} filter={filter} />;
}

/** Small status overlay for connecting / offline tiles. */
function Status({ label, spin }: { label: string; spin?: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#05080c', color: 'var(--faint)', gap: 8 }}>
      <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth={1.6} style={spin ? { animation: 'spin 1s linear infinite' } : undefined}>
        {spin
          ? <path d="M21 12a9 9 0 11-6.2-8.6" />
          : <><path d="M2 8.8a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0" /><path d="M12 20h.01" /><path d="M3 3l18 18" stroke="var(--alert)" /></>}
      </svg>
      <span style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>{label}</span>
    </div>
  );
}

/**
 * MJPEG (single multipart src) or polled snapshot.
 *
 * Snapshots preload each frame off-screen and only swap it in once decoded, so
 * slow links degrade to fewer fps instead of a blank tile. Polling pauses while
 * the tile is scrolled off-screen (IntersectionObserver) to save data and proxy
 * calls, keeps the last good frame, and shows a "Signal lost" overlay after
 * repeated failures instead of the browser's broken-image icon.
 */
function ImageStream({ url, refreshMs, filter, style, onStatus }: { url: string; refreshMs?: number; filter?: string; style?: CSSProperties; onStatus?: (s: 'ok' | 'lost') => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | undefined>(refreshMs ? undefined : url);
  const [state, setState] = useState<'connecting' | 'ok' | 'lost'>(refreshMs ? 'connecting' : 'ok');
  const visible = useRef(true);
  const errors = useRef(0);
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;

  useEffect(() => {
    if (!refreshMs) { setSrc(url); return; }
    let stopped = false;
    let timer = 0;
    const sep = url.includes('?') ? '&' : '?';

    const loadNext = () => {
      if (stopped) return;
      if (!visible.current) { timer = window.setTimeout(loadNext, 1000); return; } // paused off-screen
      const next = `${url}${sep}_t=${Date.now()}`;
      const img = new Image();
      img.onload = () => {
        if (stopped) return;
        errors.current = 0;
        setSrc(next);
        setState('ok');
        statusRef.current?.('ok');
        timer = window.setTimeout(loadNext, refreshMs);
      };
      img.onerror = () => {
        if (stopped) return;
        errors.current += 1;
        if (errors.current >= 3) { setState((s) => (src ? s : 'lost')); statusRef.current?.('lost'); }
        timer = window.setTimeout(loadNext, Math.max(refreshMs, 3000));
      };
      img.src = next;
    };
    loadNext();
    return () => { stopped = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refreshMs]);

  // Pause polling while off-screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => { visible.current = entries[0]?.isIntersecting ?? true; }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fit = (style?.objectFit as CSSProperties['objectFit']) ?? 'cover';
  return (
    <div ref={wrapRef} style={{ ...FILL, filter, overflow: 'hidden', ...style }}>
      {src && <img src={src} alt="camera" onError={() => { errors.current += 1; if (errors.current >= 3 && !src) setState('lost'); }} style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />}
      {!src && state === 'connecting' && <Status label="Connecting…" spin />}
      {!src && state === 'lost' && <Status label="Signal lost" />}
    </div>
  );
}

function VideoStream({ camera, style, muted, filter }: { camera: Camera; style?: CSSProperties; muted: boolean; filter?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera.streamUrl) return;
    const url = resolveUrl(camera.streamUrl, !!camera.proxied);

    if (camera.streamType === 'webrtc') return attachWhep(video, url);

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      const onLoaded = () => { void video.play().catch(() => {}); };
      video.addEventListener('loadedmetadata', onLoaded);
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }

    let destroy = () => {};
    let cancelled = false;
    void import('hls.js').then(({ default: Hls }) => {
      if (cancelled || !Hls.isSupported()) return;
      const hls = new Hls({ lowLatencyMode: true, enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { void video.play().catch(() => {}); });
      destroy = () => hls.destroy();
    });
    return () => { cancelled = true; destroy(); };
  }, [camera.streamUrl, camera.streamType, camera.proxied]);

  return <video ref={videoRef} muted={muted} autoPlay playsInline style={{ ...FILL, filter, ...style }} />;
}

/** Minimal WHEP client: POST the SDP offer, apply the SDP answer. */
function attachWhep(video: HTMLVideoElement, url: string): () => void {
  const pc = new RTCPeerConnection();
  let closed = false;
  pc.addTransceiver('video', { direction: 'recvonly' });
  pc.addTransceiver('audio', { direction: 'recvonly' });
  pc.ontrack = (e) => { if (e.streams[0]) video.srcObject = e.streams[0]; };
  (async () => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/sdp' }, body: offer.sdp ?? '' });
      const answer = await res.text();
      if (!closed) await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    } catch { /* stream unavailable */ }
  })();
  return () => { closed = true; pc.close(); };
}

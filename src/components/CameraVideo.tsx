import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Camera } from '../data/cameras';
import { Scene } from './common';

const FILL: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#05080c' };

/**
 * Route an HTTP camera URL through the Netlify proxy when the app itself is
 * served over HTTPS — browsers block mixed (HTTP-in-HTTPS) content otherwise.
 */
function resolveUrl(url: string): string {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http:')) {
    return `/camproxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Renders a camera's live video.
 *
 * - `hls`      → hls.js (or native HLS on Safari)
 * - `webrtc`   → WHEP handshake
 * - `mjpeg`    → <img> multipart Motion-JPEG stream
 * - `snapshot` → <img> re-fetched a few times per second (robust behind a proxy)
 * - no stream  → gradient placeholder
 */
export function CameraVideo({ camera, index, style, muted = true }: { camera: Camera; index: number; style?: CSSProperties; muted?: boolean }) {
  if (!camera.streamUrl) return <Scene index={index} style={style} />;
  if (camera.streamType === 'mjpeg') return <ImageStream url={resolveUrl(camera.streamUrl)} style={style} />;
  if (camera.streamType === 'snapshot') return <ImageStream url={resolveUrl(camera.streamUrl)} refreshMs={150} style={style} />;
  return <VideoStream camera={camera} style={style} muted={muted} />;
}

/** MJPEG (single src) or polled snapshot (cache-busted src on an interval). */
function ImageStream({ url, refreshMs, style }: { url: string; refreshMs?: number; style?: CSSProperties }) {
  const [src, setSrc] = useState(url);
  useEffect(() => {
    if (!refreshMs) { setSrc(url); return; }
    const sep = url.includes('?') ? '&' : '?';
    const tick = () => setSrc(`${url}${sep}_t=${Date.now()}`);
    tick();
    const iv = window.setInterval(tick, refreshMs);
    return () => window.clearInterval(iv);
  }, [url, refreshMs]);
  return <img src={src} alt="camera" style={{ ...FILL, ...style }} />;
}

function VideoStream({ camera, style, muted }: { camera: Camera; style?: CSSProperties; muted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera.streamUrl) return;
    const url = resolveUrl(camera.streamUrl);

    if (camera.streamType === 'webrtc') {
      return attachWhep(video, url);
    }

    // Native HLS (Safari) needs no library.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      const onLoaded = () => { void video.play().catch(() => {}); };
      video.addEventListener('loadedmetadata', onLoaded);
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }

    // Elsewhere, load hls.js on demand so it stays out of the initial bundle.
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
  }, [camera.streamUrl, camera.streamType]);

  return <video ref={videoRef} muted={muted} autoPlay playsInline style={{ ...FILL, ...style }} />;
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
    } catch {
      /* stream unavailable — video simply stays black */
    }
  })();

  return () => { closed = true; pc.close(); };
}

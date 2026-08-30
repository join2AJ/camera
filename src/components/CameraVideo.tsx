import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Camera } from '../data/cameras';
import { Scene } from './common';

const FILL: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#05080c' };

/**
 * Route a camera URL through the Netlify proxy when needed:
 * - `force` (camera.proxied): the camera host isn't reachable from the client
 *   directly (geo/network blocked) so it must be fetched server-side.
 * - HTTP URL on an HTTPS page: browsers block mixed content otherwise.
 */
function resolveUrl(url: string, force = false): string {
  const https = typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (force || (https && url.startsWith('http:'))) {
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
  const force = !!camera.proxied;
  if (camera.streamType === 'mjpeg') return <ImageStream url={resolveUrl(camera.streamUrl, force)} style={style} />;
  if (camera.streamType === 'snapshot') return <ImageStream url={resolveUrl(camera.streamUrl, force)} refreshMs={camera.refreshMs ?? 1000} style={style} />;
  return <VideoStream camera={camera} style={style} muted={muted} />;
}

/**
 * MJPEG (single multipart src) or polled snapshot.
 *
 * For snapshots we preload each frame in a detached Image and only swap it into
 * the DOM once it has fully decoded, then wait `refreshMs` before fetching the
 * next. This never cancels an in-flight download, so it degrades gracefully on
 * slow links (fewer fps) instead of showing a permanently blank tile.
 */
function ImageStream({ url, refreshMs, style }: { url: string; refreshMs?: number; style?: CSSProperties }) {
  const [src, setSrc] = useState<string | undefined>(refreshMs ? undefined : url);

  useEffect(() => {
    if (!refreshMs) { setSrc(url); return; }
    let stopped = false;
    let timer = 0;
    const sep = url.includes('?') ? '&' : '?';

    const loadNext = () => {
      if (stopped) return;
      const next = `${url}${sep}_t=${Date.now()}`;
      const img = new Image();
      img.onload = () => {
        if (stopped) return;
        setSrc(next);
        timer = window.setTimeout(loadNext, refreshMs);
      };
      img.onerror = () => {
        if (stopped) return;
        timer = window.setTimeout(loadNext, Math.max(refreshMs, 3000));
      };
      img.src = next;
    };
    loadNext();
    return () => { stopped = true; window.clearTimeout(timer); };
  }, [url, refreshMs]);

  return <img src={src} alt="camera" style={{ ...FILL, ...style }} />;
}

function VideoStream({ camera, style, muted }: { camera: Camera; style?: CSSProperties; muted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera.streamUrl) return;
    const url = resolveUrl(camera.streamUrl, !!camera.proxied);

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

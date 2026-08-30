import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { Camera } from '../data/cameras';
import { Scene } from './common';

/**
 * Renders a camera's live video.
 *
 * - `streamType: 'hls'`  → hls.js (or native HLS on Safari)
 * - `streamType: 'webrtc'` → WHEP (WebRTC-HTTP Egress) handshake
 * - no stream → gradient placeholder (demo cameras)
 *
 * The surface fills its positioned parent; overlays are rendered as siblings.
 */
export function CameraVideo({ camera, index, style, muted = true }: { camera: Camera; index: number; style?: CSSProperties; muted?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !camera.streamUrl) return;

    if (camera.streamType === 'webrtc') {
      return attachWhep(video, camera.streamUrl);
    }

    // Native HLS (Safari) needs no library.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = camera.streamUrl;
      const onLoaded = () => { void video.play().catch(() => {}); };
      video.addEventListener('loadedmetadata', onLoaded);
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }

    // Elsewhere, load hls.js on demand so it stays out of the initial bundle.
    let destroy = () => {};
    let cancelled = false;
    const url = camera.streamUrl;
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

  if (!camera.streamUrl) return <Scene index={index} style={style} />;

  return (
    <video
      ref={videoRef}
      muted={muted}
      autoPlay
      playsInline
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#05080c', ...style }}
    />
  );
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
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp ?? '',
      });
      const answer = await res.text();
      if (!closed) await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    } catch {
      /* stream unavailable — video simply stays black */
    }
  })();

  return () => { closed = true; pc.close(); };
}

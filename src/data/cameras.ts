export type StreamType = 'hls' | 'webrtc' | 'mjpeg' | 'snapshot';

export interface Camera {
  n: string;
  id: string;
  loc: string;
  people: number;
  face: boolean;
  /** Optional live stream. When absent, the UI shows a gradient placeholder. */
  streamType?: StreamType;
  streamUrl?: string;
  /** Snapshot poll interval in ms (default 1000). */
  refreshMs?: number;
  /** Force fetching through the server-side proxy (host not reachable client-side). */
  proxied?: boolean;
  /** CSS filter applied to the rendered frame (from saved image adjustments). */
  imgFilter?: string;
}

/**
 * Default camera fleet — real, public NYC DOT traffic cameras (HTTPS JPEG
 * snapshots), so the app shows live video out of the box. Source:
 * https://webcams.nyctmc.org/api/cameras (public, government-operated).
 * In a real deployment this list comes from your NVR / discovery service.
 */
export const CAMERAS: Camera[] = [
  { n: 'Broadway @ 42 St', id: 'NYC-01', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/9565e94d-66f2-4965-9c13-82d5500d6cfd/image', proxied: true },
  { n: 'Broadway @ Columbus Circle', id: 'NYC-02', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/c880d0c4-db84-44c2-9f00-62f21a83b5d0/image', proxied: true },
  { n: '5 Ave @ 42 St', id: 'NYC-03', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/f4e822f7-d2a2-4146-851c-04b2fa6d5265/image', proxied: true },
  { n: '1 Ave @ 42 St', id: 'NYC-04', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/f0e5c9aa-7700-4918-834f-c106189bde4b/image', proxied: true },
  { n: '2 Ave @ 42 St', id: 'NYC-05', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/8f692f55-8118-423b-8bcb-1ea49eaf442b/image', proxied: true },
  { n: 'Canal St @ Holland Tunnel', id: 'NYC-06', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/25ad72fe-e74c-49af-b4c0-34c9eac14655/image', proxied: true },
  { n: 'FDR Dr @ Brooklyn Bridge', id: 'NYC-07', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/ecba28cb-ac70-4d25-abcb-6506111ea120/image', proxied: true },
  { n: 'Central Park West @ 86 St', id: 'NYC-08', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/8a6bc417-4877-4ebe-8052-88c1b261baf1/image', proxied: true },
  { n: 'East 60th St @ Queensboro Bridge', id: 'NYC-09', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/d83aed40-b117-424b-8caf-35c3afe82527/image', proxied: true },
  { n: 'Canal St @ Chrystie St', id: 'NYC-10', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/8cc75cbc-e050-4947-aee8-639f63fe4ca7/image', proxied: true },
  { n: 'FDR Drive @ 122 St', id: 'NYC-11', loc: 'Manhattan · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/ec1e7b42-18de-4475-8c89-9e80f21e5b6c/image', proxied: true },
  { n: 'Grand Central Pkwy @ Midland', id: 'NYC-12', loc: 'Queens · Traffic', people: 0, face: false, streamType: 'snapshot', streamUrl: 'https://webcams.nyctmc.org/api/cameras/3793f20a-28ce-411d-b09b-f7baa2b6d55b/image', proxied: true },
];

/** Layered gradients that read as a camera scene — a stand-in for a real video stream. */
export const SCENES: string[] = [
  'radial-gradient(120% 90% at 30% 10%,#243b4a,#0b1620 70%),linear-gradient(180deg,#16303f 0%,#0a141c 55%,#060d13 100%)',
  'radial-gradient(140% 80% at 70% 0%,#3a3320,#120f0a 65%),linear-gradient(180deg,#2a2415,#0d0b07)',
  'radial-gradient(120% 100% at 50% 120%,#1d3a3f,#0a1418 60%),linear-gradient(180deg,#122a30,#08131a)',
  'radial-gradient(120% 90% at 20% 100%,#2b2340,#0d0a16 60%),linear-gradient(180deg,#1c1830,#0a0812)',
  'radial-gradient(120% 90% at 80% 20%,#243b30,#0a1610 70%),linear-gradient(180deg,#152a20,#080f0b)',
  'radial-gradient(130% 90% at 40% 10%,#33262a,#120b0d 65%),linear-gradient(180deg,#241419,#0c070a)',
];

import type { CSSProperties } from 'react';

export function sceneStyle(i: number): CSSProperties {
  return { background: SCENES[i % SCENES.length], backgroundBlendMode: 'screen' };
}

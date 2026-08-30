/**
 * Typed API client.
 *
 * Today this is backed by the in-memory demo data in `src/data`. Each method is
 * async and returns the same shapes a real backend would, so swapping in `fetch`
 * calls later is a drop-in change — the pages and context already `await` these.
 *
 * To go live, replace the bodies below with requests to your VMS/NVR API, e.g.:
 *   const res = await fetch(`${BASE}/cameras`, { headers: authHeaders() });
 *   return res.json();
 */
import { CAMERAS, type Camera } from '../data/cameras';
import { SITES, type Site } from '../data/sites';
import { INCOMING, SEED_ALARMS, newAlarmId, type Alarm } from '../data/alarms';

/** Simulated network latency so loading states behave like the real thing. */
const LATENCY = 120;
const delay = <T>(value: T, ms = LATENCY): Promise<T> =>
  new Promise((resolve) => window.setTimeout(() => resolve(value), ms));

const pad = (n: number) => (n < 10 ? '0' : '') + n;
const nowHM = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** In-memory camera store — a stand-in for server persistence. */
const cameraStore: Camera[] = [...CAMERAS];

export interface NewCameraInput {
  n: string;
  loc: string;
  streamType?: Camera['streamType'];
  streamUrl?: string;
}

export const api = {
  cameras: {
    list: (): Promise<Camera[]> => delay([...cameraStore]),
    /** Persist a new camera and return the created record with its assigned id. */
    add: (input: NewCameraInput): Promise<Camera> => {
      const num = cameraStore.length + 1;
      const cam: Camera = {
        n: input.n,
        id: `CAM-${pad(num)}`,
        loc: input.loc,
        people: 0,
        face: false,
        streamType: input.streamType,
        streamUrl: input.streamUrl,
      };
      cameraStore.push(cam);
      return delay(cam, 300);
    },
  },

  sites: {
    list: (): Promise<Site[]> => delay([...SITES]),
  },

  alarms: {
    list: (): Promise<Alarm[]> => delay([...SEED_ALARMS]),
    /**
     * Subscribe to live alarms. Backed by a demo interval today; swap for a
     * WebSocket/SSE by calling `onAlarm` with each server-pushed event.
     * Returns an unsubscribe function.
     */
    stream(onAlarm: (a: Alarm) => void): () => void {
      let ptr = 0;
      const iv = window.setInterval(() => {
        const src = INCOMING[ptr % INCOMING.length];
        ptr += 1;
        onAlarm({ ...src, id: newAlarmId(), ack: false, sub: `${src.sub} · ${nowHM()}` });
      }, 14000);
      return () => window.clearInterval(iv);
    },
  },
};

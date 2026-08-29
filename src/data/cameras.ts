export interface Camera {
  n: string;
  id: string;
  loc: string;
  people: number;
  face: boolean;
}

/** Demo camera fleet. In a real deployment this comes from the NVR / discovery service. */
export const CAMERAS: Camera[] = [
  { n: 'West Entrance', id: 'CAM-01', loc: 'Door · 4K', people: 2, face: true },
  { n: 'Parking Lot A', id: 'CAM-02', loc: 'Wide · 4K', people: 1, face: false },
  { n: 'Lobby', id: 'CAM-03', loc: 'PTZ · 4K', people: 3, face: true },
  { n: 'Loading Dock', id: 'CAM-04', loc: 'Wide · 4K', people: 1, face: false },
  { n: 'Corridor 2F', id: 'CAM-05', loc: 'Fixed · 2K', people: 0, face: false },
  { n: 'Roof Access', id: 'CAM-06', loc: 'Fixed · 2K', people: 0, face: false },
  { n: 'Server Room', id: 'CAM-07', loc: 'Fixed · 2K', people: 0, face: false },
  { n: 'Cafeteria', id: 'CAM-08', loc: 'Wide · 4K', people: 5, face: false },
  { n: 'Reception', id: 'CAM-09', loc: 'PTZ · 4K', people: 2, face: true },
  { n: 'Stairwell B', id: 'CAM-10', loc: 'Fixed · 2K', people: 0, face: false },
  { n: 'Perimeter N', id: 'CAM-11', loc: 'Thermal', people: 0, face: false },
  { n: 'Garage Gate', id: 'CAM-12', loc: 'LPR · 4K', people: 1, face: false },
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

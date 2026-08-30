export type Severity = 'crit' | 'warnb' | 'infob';
export type IconKind = 'alert' | 'motion' | 'accent' | 'ai';

export interface Alarm {
  id: number;
  sev: Severity;
  title: string;
  sub: string;
  kind: IconKind;
  icon: string; // inner SVG markup for the icon
  ack: boolean;
}

let nextId = 1000;
export const newAlarmId = () => ++nextId;

export const SEED_ALARMS: Alarm[] = [
  { id: 1, sev: 'crit', title: 'Fence breach · Zone A', sub: 'Loading Dock · CAM-04 · 13:47', kind: 'alert', icon: '<path d="M12 2l9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6z"/>', ack: false },
  { id: 2, sev: 'crit', title: 'Deny-list plate · 9ZQ·3388', sub: 'Garage Gate · CAM-12 · 13:12', kind: 'alert', icon: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 10v4M10 10v4M14 10v4M18 10v4"/>', ack: false },
  { id: 3, sev: 'warnb', title: 'Unknown face · no match', sub: 'Reception · CAM-09 · 12:19', kind: 'motion', icon: '<circle cx="12" cy="9" r="4"/><path d="M5 20a7 7 0 0114 0"/>', ack: false },
  { id: 4, sev: 'warnb', title: 'Camera signal degraded', sub: 'Perimeter N · CAM-11 · 52%', kind: 'motion', icon: '<path d="M2 20h.01M6 20a10 10 0 0116 0M9 20a6 6 0 0110 0"/>', ack: true },
  { id: 5, sev: 'infob', title: 'Occupancy near capacity', sub: 'Atrium · 312 / 400 · 08:40', kind: 'accent', icon: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0112 0"/>', ack: true },
  { id: 6, sev: 'infob', title: 'Firmware updates available', sub: '3 cameras · v4.3.0', kind: 'accent', icon: '<path d="M12 3v12M7 10l5 5 5-5"/>', ack: true },
];

/** Pool of alarms that stream in live, cycled by the alarm feed. */
export const INCOMING: Omit<Alarm, 'id' | 'ack'>[] = [
  { sev: 'warnb', title: 'Motion after hours', sub: 'Parking Lot A · CAM-02', kind: 'motion', icon: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>' },
  { sev: 'crit', title: 'Fence breach · Zone B', sub: 'Loading Dock · CAM-04', kind: 'alert', icon: '<path d="M12 2l9 4v6c0 5-4 8-9 10-5-2-9-5-9-10V6z"/>' },
  { sev: 'infob', title: 'Face match · VIP', sub: 'Lobby · FID-0061 · M. Reyes', kind: 'accent', icon: '<path d="M12 2l2.4 6.9H21l-5.3 4.1 2 6.9L12 16l-5.7 3.9 2-6.9L3 8.9h6.6z"/>' },
  { sev: 'warnb', title: 'Tailgating detected', sub: 'Reception turnstile · CAM-09', kind: 'motion', icon: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0112 0"/>' },
  { sev: 'crit', title: 'Deny-list plate', sub: 'Garage Gate · 1HH·0042', kind: 'alert', icon: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 10v4M10 10v4M14 10v4M18 10v4"/>' },
  { sev: 'infob', title: 'Camera back online', sub: 'Perimeter N · CAM-11', kind: 'accent', icon: '<path d="M2 20h.01M6 20a10 10 0 0116 0"/>' },
];

export function iconBg(k: IconKind): string {
  return k === 'ai' ? 'rgba(163,113,247,.14)'
    : k === 'alert' ? 'rgba(229,83,75,.14)'
    : k === 'motion' ? 'rgba(217,164,65,.14)'
    : 'rgba(53,201,216,.14)';
}
export function iconFg(k: IconKind): string {
  return k === 'ai' ? 'var(--ai)'
    : k === 'alert' ? 'var(--alert)'
    : k === 'motion' ? 'var(--motion)'
    : 'var(--accent)';
}

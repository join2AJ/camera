/** Nav + top-bar icon inner markup, keyed by name. Rendered inside a 24x24 stroked <svg>. */
import type { ReactElement } from 'react';

export const navIcons: Record<string, ReactElement> = {
  live: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="12" cy="12" r="3.5" /></>,
  playback: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" /></>,
  analytics: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  map: <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15" />,
  lpr: <><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M6 10v4M9 10v4M12 10v4M15 10v4M18 10v4" /></>,
  maintenance: <path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.8-.7-.7-2.8z" />,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0111 0M16 6.5a3 3 0 010 6M17.5 19a5.5 5.5 0 00-2-4.3" /></>,
  storage: <><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.3l2-1.6-2-3.4-2.4 1a7 7 0 00-2.3-1.3l-.3-2.6H10.1l-.3 2.6a7 7 0 00-2.3 1.3l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .9.1 1.3l-2 1.6 2 3.4 2.4-1a7 7 0 002.3 1.3l.3 2.6h3.8l.3-2.6a7 7 0 002.3-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z" /></>,
};

export const brandIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3l4.5 7.8M20.5 9.5l-9 .2M16.5 20l-4.5-7.8M3.5 14.5l9-.2M7.5 4L12 12M3.5 9.5l9 2.5" />
  </svg>
);

export const moonIcon = <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />;
export const sunIcon = <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></>;
export const bellIcon = <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />;

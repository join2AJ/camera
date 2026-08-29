# Aperture VMS

A web console for a smart‑camera video management system — live view, playback,
AI analytics, storage, and maintenance. This repository contains the **frontend
application**: a React + Vite + TypeScript single‑page app.

> The data is currently mocked and the video surfaces are gradient placeholders.
> The UI is deliberately **stream‑protocol‑agnostic** so a real player (HLS,
> WebRTC, or an RTSP proxy) can be dropped in without changing the screens.

## Features

| Area | What's there |
| --- | --- |
| **Live** | Camera wall with AI overlays (person/face boxes, live people counts), camera list, selected‑feed stats |
| **Playback** | Draggable 24‑hour timeline, click‑to‑seek events, calendar date picker, play/pause + speed |
| **AI Analytics** | Face recognition (FIDs), virtual fencing zones/tripwires, people counting (charts + gauge), attendance & movement, alert rules (VIP / gov / watchlist / ANPR) |
| **Site Map** | Floor plan with camera pins and coverage cones |
| **License Plates** | ANPR read log with allow / deny lists |
| **Storage** | On‑device ⇄ cloud, capacity bars, encryption (AES‑256 / TLS 1.3 / KMS), retention sliders |
| **Maintenance** | Fleet health table, firmware, system log |
| **Users** | Roles, permissions matrix, tamper‑evident audit trail |
| **Camera Settings** | Per‑camera Image / Stream / Network / Recording config incl. remote access (P2P, DDNS, WebRTC, VPN) |
| **System Settings** | Org, appearance (theme), recording defaults, network & integrations |
| **Shell** | Multi‑site switcher, dark/light theme (persisted), live alarm feed with slide‑in toast |

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

Requires Node 18+.

## Project structure

```
src/
  main.tsx                 App entry (Router + StrictMode)
  App.tsx                  Routes → Shell layout
  context/AppContext.tsx   Theme, current site, live alarm feed
  hooks/useClock.ts        Ticking wall clock
  components/
    Shell.tsx              Layout: Rail + TopBar + <Outlet/> + AlarmDrawer + toast
    Rail.tsx  TopBar.tsx  AlarmDrawer.tsx
    common.tsx  charts.tsx  icons.tsx
  data/                    Mock cameras, sites, alarms
  pages/                   One component per screen
  styles/global.css        Design tokens + component styles (dark‑first, light theme)
```

## Design system

- **Dark‑first** operations console; light theme is an opt‑in toggle and persists to `localStorage`.
- Semantic color encodes state (online / motion / alert / AI), separate from the cyan accent.
- Type: Chakra Petch (display/metrics), IBM Plex Sans (UI), IBM Plex Mono (data).

## Wiring real cameras (next steps)

- Replace the gradient `Scene` placeholders with a video element fed by your
  streaming stack (HLS.js, WebRTC/go2rtc, or an RTSP→WebRTC proxy).
- Swap the `data/` modules for API calls (cameras, events, analytics, storage).
- Back the alarm feed with a WebSocket instead of the demo interval.

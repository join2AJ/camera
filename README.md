# Aperture VMS

A web console for a smart‑camera video management system — live view, playback,
AI analytics, storage, and maintenance. This repository contains the **frontend
application**: a React + Vite + TypeScript single‑page app.

> Data is served through a typed API client (`src/api/client.ts`) currently
> backed by in‑memory demo data — swap the method bodies for `fetch` calls to go
> live. Camera tiles render a real player: **HLS** (via a lazily‑loaded hls.js,
> or native HLS on Safari) and **WebRTC/WHEP**, falling back to a gradient
> placeholder when a camera has no stream URL.

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
| **Add camera** | 4‑step wizard (source → details → stream → confirm) that adds a camera through the API client |
| **Streaming** | `CameraVideo` plays HLS (hls.js / native) and WebRTC (WHEP); gradient fallback otherwise |

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
  api/client.ts            Typed API client (async; demo-backed, fetch-ready)
  context/AppContext.tsx   Theme, current site, camera store, live alarm stream
  hooks/useClock.ts        Ticking wall clock
  components/
    Shell.tsx              Layout: Rail + TopBar + <Outlet/> + AlarmDrawer + toast
    Rail.tsx  TopBar.tsx  AlarmDrawer.tsx
    CameraVideo.tsx        HLS / WebRTC player with gradient fallback
    AddCameraWizard.tsx    4-step add-camera modal
    common.tsx  charts.tsx  icons.tsx
  data/                    Demo cameras, sites, alarms (client backing store)
  pages/                   One component per screen
  styles/global.css        Design tokens + component styles (dark‑first, light theme)
```

## Design system

- **Dark‑first** operations console; light theme is an opt‑in toggle and persists to `localStorage`.
- Semantic color encodes state (online / motion / alert / AI), separate from the cyan accent.
- Type: Chakra Petch (display/metrics), IBM Plex Sans (UI), IBM Plex Mono (data).

## Connecting an HTTP camera (e.g. AXIS MJPEG) on an HTTPS site

Browsers block an HTTPS page from loading an HTTP camera ("mixed content"), and
a page like `…/cgi-bin/guestimage.html` is a *viewer*, not a stream. To show such
a camera:

1. Find the camera's **image endpoint**, not its HTML page. For AXIS:
   - snapshot: `http://<host>:<port>/axis-cgi/jpg/image.cgi`
   - MJPEG:    `http://<host>:<port>/axis-cgi/mjpg/video.cgi`
   (older firmware: `/jpg/image.jpg`, `/mjpg/video.mjpg`)
2. Add the camera with stream type **Snapshot (polled)** and that URL. Snapshot
   mode is the reliable choice behind the proxy; true MJPEG streaming can't pass
   through a serverless function.
3. Deploy on Netlify. `netlify.toml` routes `/camproxy` to
   `netlify/functions/camproxy.mjs`, which fetches the HTTP camera server-side
   and returns it over HTTPS. The app auto-routes any `http://` camera through
   `/camproxy` when it's running on HTTPS.
4. Allow your camera's host: set the `CAM_PROXY_ALLOW` env var in Netlify
   (comma-separated hostnames, or `*` to allow any — not recommended). Edit
   `DEFAULT_ALLOW` in the function for a committed default.

> The proxy only handles single-JPEG responses (snapshots). Multipart MJPEG and
> RTSP need a media server (go2rtc / MediaMTX) that emits HLS or WebRTC instead.

## Wiring real cameras (next steps)

- **Streaming is ready**: give a camera a `streamType` (`'hls'` | `'webrtc'`) and
  `streamUrl` and `CameraVideo` will play it. Point cameras at your streaming
  stack (an `.m3u8` from your NVR/packager, or a WHEP endpoint from
  go2rtc/MediaMTX). RTSP-only cameras need a proxy to HLS or WebRTC first.
- Swap the bodies in `src/api/client.ts` for `fetch` calls (cameras, events,
  analytics, storage) — the pages and context already `await` them.
- Back `api.alarms.stream()` with a WebSocket/SSE instead of the demo interval.
- The remaining pages (Map, Maintenance, Users, etc.) still read demo arrays
  directly; migrate each to the API client the same way Live/Playback/Settings do.

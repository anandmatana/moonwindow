# MoonWindow

MoonWindow is a web-based Moon visibility and 3D sky-finding app. It calculates live Moon astronomy in the browser, combines it with weather, and guides users with device orientation and an optional camera view.

## Repository structure

```text
moonwindow/
├── frontend/   React + TypeScript + Vite PWA
├── backend/    Node.js HTTP API
├── MoonWindow_Phase_1_README.md
├── ROADMAP_PHASES_2_TO_4.md
└── render.yaml
```

## Phase 1 status

- Precise browser geolocation plus Indian-city fallback
- Live altitude, azimuth, direction, phase, illumination and distance
- Moonrise and moonset
- Hourly Moon path and visibility timeline
- Weather-aware visibility score with cached fallback
- 3D Moon Finder using yaw, pitch and roll
- Optional live-camera Sky Finder
- Karwa Chauth occasion guide and disclaimer
- Moon details, accuracy, privacy and feedback views
- Sensor, camera, GPS and weather failure states
- Responsive animated space UI
- Installable PWA/offline shell
- Privacy-first on-device astronomy

## Local development

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Backend:

```bash
cd backend
npm start
```

Copy `frontend/.env.example` to `frontend/.env` when using the local API.

## Render deployment

The repository includes `render.yaml`, or create both services manually from the same repository.

### Backend Web Service

- Root directory: `backend`
- Runtime: Node
- Build command: leave empty
- Start command: `npm start`
- Health check: `/api/health`
- Set `FRONTEND_URL` to the deployed frontend URL

### Frontend Static Site

- Root directory: `frontend`
- Build command: `pnpm install --frozen-lockfile && pnpm run build`
- Publish directory: `dist`
- Rewrite: `/*` → `/index.html`
- Set `VITE_API_URL` to the deployed backend URL

## Production build

```bash
cd frontend
pnpm run build
```

Generated assets are written to `frontend/dist/`.

## Product scope

MoonWindow remains a web app through Phase 4. Device features use standard browser APIs; no native Android or iOS app is planned in the current roadmap.

See [Phase 1 specification](./MoonWindow_Phase_1_README.md) and [Phases 2–4 roadmap](./ROADMAP_PHASES_2_TO_4.md).

## License

Copyright © 2026 MoonWindow. All rights reserved.

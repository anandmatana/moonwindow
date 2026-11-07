# MoonWindow

**Know exactly when and where to look for the Moon.**

MoonWindow is a mobile-first Moon visibility website for India. It calculates the Moon's live position locally in the browser and combines it with current weather conditions to estimate viewing quality.

## Live website

**https://moonwindow.vercel.app/**

## Phase 1 features

- Browser geolocation with manual Indian-city fallback
- Live Moon altitude, azimuth and compass direction
- Moonrise, moonset, phase, illumination and distance
- Hourly Moon path and visibility timeline
- Cached Open-Meteo cloud and visibility data
- Compass-based **Find the Moon** experience
- Camera-assisted **Sky Finder Beta**
- Karwa Chauth occasion guide
- Accuracy and privacy pages
- Installable PWA with offline shell caching
- No account required; precise location and sensor data stay on-device

## Technology

- React 19
- TypeScript
- Vite
- Astronomy Engine
- Open-Meteo weather adapter
- Vite PWA
- Vercel static hosting

## Local development

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Production build

```bash
pnpm run build
```

The deployable static output is generated in `dist/`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Live Moon status and viewing timeline |
| `/find` | Compass Moon finder |
| `/sky` | Camera-assisted Sky Finder |
| `/moon` | Detailed astronomical data |
| `/karwa-chauth-moon` | Occasion-specific Moon guide |
| `/accuracy` | Calculation and sensor limitations |
| `/privacy` | Location, camera and storage policy |

## Privacy

Moon calculations run in the browser. MoonWindow does not store precise coordinates, camera feeds, orientation history or location history. Weather requests use coordinates only to retrieve local atmospheric conditions and are cached in the browser.

## Accuracy notice

Astronomy determines the Moon's geometric position. Buildings, hills, trees, compass calibration and local weather can affect real-world visibility. Occasion timings are astronomical estimates, not official religious declarations.

## Deployment

Vercel configuration is included in `vercel.json`. For a manual static deployment, upload the contents of `dist/`.

## Documentation

The complete Phase 1 product and technical specification is available in [MoonWindow_Phase_1_README.md](./MoonWindow_Phase_1_README.md).

## License

Copyright © 2026 MoonWindow. All rights reserved.

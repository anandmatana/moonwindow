# MoonWindow — Phase 1 Website Product & Technical Specification

**Product:** MoonWindow  
**Primary domain:** `moonwindow.in`  
**Document type:** Lightweight implementation README / PRD  
**Phase:** Phase 1 — Mobile-first Moon visibility website  
**Primary market:** India  
**Primary use cases:** Moon visibility, moonrise timing, direction finding, religious/festival use, general sky tracking  
**Core principle:** Premium experience with the lowest practical recurring infrastructure cost.

---

## 1. Phase 1 Goal

Build a fast, trustworthy, mobile-first website that answers four questions immediately:

1. **When will the Moon be visible from my exact location?**
2. **Which direction should I look?**
3. **How high above the horizon will it be?**
4. **How likely is it to be visible considering current cloud/weather conditions?**

The site should work without account creation.

The first useful result should appear within a few seconds after the user grants location permission.

Phase 1 should prove that users find MoonWindow useful before we spend money on a native app, advanced AR, subscriptions, large infrastructure, or a large database.

---

# 2. Phase 1 Product Scope

## Included

### A. Location-based Moon tracking

Use the browser's native Geolocation API to obtain:

- Latitude
- Longitude
- Estimated device location accuracy

Do **not** send precise coordinates to our database by default.

Use coordinates locally to calculate Moon information.

Show:

- Current location label when available
- Location accuracy
- Option to refresh location
- Manual city/location input fallback

---

### B. Today's Moon card

The primary card should show:

- Moonrise time
- Moonset time
- Current Moon altitude
- Current Moon azimuth
- Compass direction
- Moon phase
- Illumination percentage
- Distance from Earth
- Next major phase
- Current status:
  - Not risen yet
  - Above horizon
  - Setting soon
  - Below horizon

Example:

> Moon rises at **8:14 PM**  
> Look **East-Northeast · 72°**  
> Current altitude **9.6°**  
> Visibility: **Good**

---

### C. "Where to Look" compass

This is the core MoonWindow feature.

Display a large premium compass-style interface showing:

- User-facing compass
- Moon marker
- Azimuth in degrees
- Cardinal/intercardinal direction
- Altitude above horizon
- Arrow showing which way the user should turn

Example:

**Moon → 78° ENE**  
**12° above horizon**

The view should update periodically while the page is open.

No paid map service is required.

---

### D. Sky Finder — Phase 1 Beta

Provide a lightweight camera-assisted mode.

Use:

- Browser camera API (`getUserMedia`)
- Device orientation / compass sensor where supported
- Calculated Moon azimuth and altitude

Overlay:

- Direction arrow
- Moon marker
- Degrees left/right
- Altitude indication

Important:

This is **not** full spatially anchored AR in Phase 1.

It is a camera + orientation guidance layer.

This dramatically reduces engineering complexity and cost while still giving users the feeling of "point the phone toward the Moon."

Fallback when sensor access is unavailable:

- Compass guidance screen
- Manual direction
- Horizon illustration

---

### E. Moon visibility indicator

Show a simple visibility confidence score.

Suggested labels:

- Excellent
- Good
- Fair
- Poor
- Moon below horizon

Visibility score can combine:

- Moon altitude
- Cloud cover
- Precipitation
- Fog / visibility data if available
- Whether Moon has risen
- Approximate twilight / sky brightness

Do not claim certainty.

Recommended wording:

> **Good chance of visibility**

instead of:

> **The Moon will definitely be visible**

---

### F. Timeline

Show a simple horizontal timeline for the next several hours.

Example:

| Time | Moon altitude | Direction | Clouds | Visibility |
|---|---:|---|---:|---|
| 7:30 PM | 2° | ENE | 21% | Fair |
| 8:00 PM | 8° | ENE | 14% | Good |
| 9:00 PM | 19° | E | 10% | Excellent |
| 10:00 PM | 30° | ESE | 13% | Excellent |

Calculations should be generated locally.

Weather values should be fetched only when needed.

---

### G. Festival / occasion mode

Phase 1 should support an occasion layer without building a complex festival system.

Examples:

- Karwa Chauth Moon
- Sharad Purnima
- Guru Purnima
- Buddha Purnima
- Eid Moon / crescent informational mode
- Full Moon
- New Moon

The home page can automatically highlight a relevant configured event.

Festival data should be stored as a tiny static configuration initially.

Example:

```ts
{
  id: "karwa-chauth",
  title: "Karwa Chauth Moon",
  date: "YYYY-MM-DD",
  region: "IN",
  enabled: true
}
```

**Important:** Religious/calendar determinations can depend on local tradition and observational rules. MoonWindow should present astronomical information and clearly distinguish it from an official religious declaration.

---

# 3. What Is NOT in Phase 1

Do not build these yet:

- User accounts
- Paid subscription
- Social network
- User profiles
- Chat
- Native Android app
- Native iOS app
- Full WebXR AR
- 3D globe
- Complex map
- Live user tracking
- Saved exact location history
- Push notification infrastructure
- AI chatbot
- Large admin dashboard
- Advanced event CMS
- Community moon reports
- Photo upload
- Astrology
- Telescope controls
- Advertisement system

These can be evaluated after Phase 1 usage data.

---

# 4. Recommended Phase 1 Technology Stack

## Frontend

### Recommended

- **React**
- **TypeScript**
- **Vite**
- Lightweight CSS / Tailwind CSS with production purge
- PWA manifest
- Native browser APIs

Why:

- Easy to hire for
- Fast development
- Excellent mobile browser support
- Static deployment
- Easy migration into a future app architecture
- Can lazy-load expensive screens

### Optional bundle optimization

If bundle size becomes a problem, React can later be replaced by **Preact** without changing the product architecture significantly.

---

# 5. Astronomy Calculation Strategy

## Recommended: Astronomy Engine

Use the open-source **Astronomy Engine** JavaScript package.

It can calculate locally in the browser:

- Moon azimuth
- Moon altitude
- Moonrise
- Moonset
- Moon phase
- Lunar distance
- Moon position
- Twilight
- Sun position

### Why this matters

The user's device performs the astronomy calculation.

Therefore:

- No Moon-position API bill
- No API key
- No astronomy request quota
- Better privacy
- Faster repeat calculations
- Works even when our backend is unavailable after the page loads
- Easy to cache

Astronomy Engine is MIT licensed and designed to run client-side.

---

# 6. Weather Strategy

Weather is **supplementary**, not the source of Moon position.

MoonWindow must still work if the weather provider fails.

## Phase 1 prototype

Use a weather-provider abstraction:

```ts
interface WeatherProvider {
  getVisibilityWeather(
    latitude: number,
    longitude: number
  ): Promise<VisibilityWeather>;
}
```

Initially a provider such as **Open-Meteo** can be used during development/prototyping.

Required variables only:

- cloud cover
- precipitation probability
- visibility if available
- relative humidity
- weather code

Avoid requesting unnecessary variables.

### Important commercial note

Open-Meteo's public free API is currently intended for non-commercial use/evaluation. If MoonWindow becomes a commercial production service, switch the adapter to:

1. Open-Meteo commercial service, or
2. Another commercial weather provider, or
3. A self-hosted/open-data weather architecture when scale justifies it.

Because MoonWindow uses a provider adapter, switching should not require redesigning the UI.

---

# 7. Weather API Cost Reduction

Never request weather continuously.

### Recommended browser caching

Cache weather response by approximate location:

- Round coordinates to ~2 decimal places for the weather cache key
- Cache duration: **15–30 minutes**
- Reuse data between screens

Example cache key:

```text
weather:18.59:73.74:2026-11-08T02
```

Moon position itself is recalculated locally and does not need caching from an API.

### Request only when

- User opens Moon status
- Location changes materially
- Cached data expires
- User explicitly refreshes

---

# 8. Device APIs — No Paid Service Required

Use browser-native features:

### Geolocation

```ts
navigator.geolocation.getCurrentPosition()
```

Cost: **₹0**

### Camera

```ts
navigator.mediaDevices.getUserMedia()
```

Cost: **₹0**

### Device orientation

Use supported browser orientation events.

Cost: **₹0**

### Timezone

Use:

```ts
Intl.DateTimeFormat().resolvedOptions().timeZone
```

Cost: **₹0**

### Compass

Use device orientation where available.

No external compass API is required.

---

# 9. Backend Strategy

## Phase 1 rule

**Do not create a backend for things that can safely happen in the browser.**

Most MoonWindow functions are deterministic calculations and should stay client-side.

Use Supabase only where persistent server-side storage adds value.

---

# 10. Supabase Phase 1 Usage

Recommended Supabase usage:

- Public feedback
- Anonymous analytics aggregation if needed
- Festival/event configuration later
- Simple operational settings
- Future waitlist

Do not require authentication in Phase 1.

## Initial tables

### `feedback`

```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  rating smallint,
  message text,
  page text,
  created_at timestamptz default now()
);
```

### `app_events`

Optional.

Use only for meaningful product events instead of recording every interaction.

```sql
create table app_events (
  id bigint generated by default as identity primary key,
  event_name text not null,
  country_code text,
  platform text,
  created_at timestamptz default now()
);
```

### `festival_config`

Can be added later.

```sql
create table festival_config (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  event_date date not null,
  enabled boolean default true,
  metadata jsonb,
  created_at timestamptz default now()
);
```

---

# 11. Privacy Architecture

This is especially important because MoonWindow requests precise location.

## Default behavior

Do **not** permanently store:

- Exact latitude
- Exact longitude
- Device compass history
- Camera feed
- Camera photos
- Location history

Coordinates should normally exist only in the user's browser memory.

If anonymous analytics need geography, store only broad geographic information such as:

- Country
- State/region where safely derived
- Rounded coarse location if legally/privacy appropriate

Never store the raw camera stream.

---

# 12. Phase 1 Pages

Keep the site small.

## Page 1 — Home `/`

Purpose:

Get the user to the answer immediately.

Sections:

1. MoonWindow logo
2. Current location
3. Main Moon status card
4. "Find the Moon" primary CTA
5. Moonrise / moonset
6. Visibility confidence
7. Timeline
8. Today's phase
9. Occasion/festival card
10. Small explanation
11. Footer

---

## Page 2 — Find the Moon `/find`

Full-screen mobile experience.

Show:

- Direction arrow
- Compass ring
- Moon marker
- Degrees
- Altitude
- Current status
- Open Camera button

Primary CTA:

**Point me to the Moon**

---

## Page 3 — Sky Finder `/sky`

Camera guidance experience.

Show:

- Camera feed
- Moon target
- Direction correction
- Current Moon altitude
- Current azimuth
- Sensor/calibration notice

Provide a fallback if the browser does not support orientation access.

---

## Page 4 — Moon Details `/moon`

Show:

- Moon phase
- Illumination
- Distance
- Rise
- Transit
- Set
- Azimuth
- Altitude
- Upcoming major phase

This page can be indexable for SEO while personalized values remain local.

---

## Page 5 — Festival page

Example:

`/karwa-chauth-moon`

Content:

- Location-aware Moon rise estimate
- Direction
- Moon visibility
- Weather
- Quick "Find the Moon" button
- Short astronomy disclaimer

This page can become an important organic-search acquisition channel.

---

## Page 6 — About / Accuracy `/accuracy`

Explain:

- How location is used
- Astronomy source/calculation model
- Difference between astronomical visibility and weather visibility
- Sensor limitations
- Weather limitations
- Why buildings/hills can delay actual visual appearance

Trust is a core product feature.

---

# 13. Mobile-First Premium UI Direction

MoonWindow should not look like a generic astronomy dashboard.

## Design character

- Light premium interface
- Warm off-white background
- Deep charcoal text
- Subtle moon-gold accent
- Large whitespace
- Large numeric readouts
- Rounded cards
- Thin borders
- Extremely subtle shadows
- No visual clutter
- No excessive gradients
- No star-field background on every page

### Inspiration

The site should feel closer to:

- premium weather app
- modern navigation app
- premium Apple-style utility

rather than:

- astrology website
- scientific control panel
- gaming interface

---

# 14. Suggested Mobile Home Layout

```text
┌─────────────────────────────┐
│ MoonWindow                  │
│ 📍 Current Location        │
├─────────────────────────────┤
│                             │
│       Waxing Gibbous        │
│            ◕                │
│                             │
│ Moon visible in             │
│        34 MIN               │
│                             │
│ Rise  8:14 PM               │
│ Look  ENE · 72°             │
│                             │
│ [ FIND THE MOON → ]         │
│                             │
├─────────────────────────────┤
│ Visibility                  │
│ ● Good                      │
│ Clouds 18%                  │
├─────────────────────────────┤
│ Best viewing                │
│ 8:35 PM — 10:20 PM          │
├─────────────────────────────┤
│ Tonight's path              │
│   ↗  ↗  →  ↘               │
├─────────────────────────────┤
│ Moon details                │
│ Illumination 82%            │
│ Altitude 7°                 │
└─────────────────────────────┘
```

---

# 15. Desktop Behavior

Desktop is secondary.

Do not design desktop first.

On wide screens:

- Keep the central experience constrained
- Maximum content width around 1100–1200 px
- Put Moon status and sky path side-by-side
- Avoid stretching cards across the entire screen
- Keep the same information hierarchy as mobile

---

# 16. Performance Targets

Phase 1 targets:

- Lighthouse Performance: **90+**
- Accessibility: **95+**
- Best Practices: **95+**
- SEO: **90+**

Target:

- Initial JS under roughly 200 KB compressed where practical
- No autoplay video
- No heavy 3D libraries
- No map SDK on the home page
- Lazy-load Sky Finder camera code
- Lazy-load festival-specific modules
- Use system fonts or one optimized variable font
- SVG icons instead of icon images
- Responsive images
- Cache static assets aggressively

---

# 17. PWA

Make MoonWindow installable.

Phase 1 PWA features:

- App icon
- Manifest
- Theme color
- Home-screen install
- Static shell cache
- Offline explanatory screen
- Last computed Moon data may be retained locally

Do not build complex offline synchronization.

---

# 18. Hosting Recommendation

## Primary recommendation

**Cloudflare Pages / Cloudflare static deployment**

Reasons:

- Excellent CDN
- Static asset delivery
- Custom domain support
- HTTPS
- Extremely low cost for static architecture
- Easy Git deployment
- Serverless functions available if later required

The architecture should still remain portable to:

- Cloudflare Workers
- Netlify
- Vercel
- AWS
- any static host

Avoid provider lock-in.

---

# 19. Domain

Primary:

**moonwindow.in**

Suggested production URLs:

```text
moonwindow.in
www.moonwindow.in
moonwindow.in/find
moonwindow.in/sky
moonwindow.in/moon
moonwindow.in/karwa-chauth-moon
moonwindow.in/accuracy
moonwindow.in/privacy
```

Redirect `www` to the canonical domain.

---

# 20. Phase 1 Cost Architecture

The goal is not merely a low bill.

The goal is to make usage growth **not directly multiply backend cost**.

## Core cost profile

| Component | Phase 1 approach | Expected baseline |
|---|---|---:|
| Moon calculations | Client-side Astronomy Engine | ₹0/request |
| GPS/location | Browser Geolocation API | ₹0 |
| Compass | Device sensor | ₹0 |
| Camera | Browser camera API | ₹0 |
| Frontend hosting | Static Cloudflare deployment | Very low / potentially ₹0 at initial scale |
| Database | Supabase Free initially | ₹0 initially |
| Weather | Cached, only when needed | Low; provider-dependent |
| Analytics | Minimal or privacy-friendly | ₹0 / low |
| Map | Not required | ₹0 |
| SMS | Not used | ₹0 |
| Email | Not required | ₹0 |
| AI | Not used | ₹0 |

### Primary variable expense

Weather data is the main likely per-usage service expense.

That is why weather must remain:

- Optional
- Cached
- Provider-abstracted
- Degraded gracefully when unavailable

---

# 21. Current Supabase Free-Tier Fit

At the time this document was prepared, Supabase's Free plan publicly listed resources suitable for an early product, including a small Postgres database and generous early-stage API/MAU allowances.

For Phase 1:

- Use one Supabase project
- Keep rows tiny
- Do not store sensor streams
- Do not store raw location history
- Do not use Realtime unless genuinely needed
- Do not store images

This keeps database usage extremely small.

---

# 22. Suggested Application Architecture

```text
                    ┌────────────────────┐
                    │   moonwindow.in    │
                    └─────────┬──────────┘
                              │
                    Static CDN / Hosting
                              │
                    ┌─────────▼──────────┐
                    │   React Web App    │
                    └─────────┬──────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────▼────────┐ ┌────────▼─────────┐ ┌──────▼─────────┐
│ Browser Location │ │ Device Compass   │ │ Browser Camera │
│       API        │ │ / Orientation    │ │      API       │
└─────────┬────────┘ └────────┬─────────┘ └────────────────┘
          │                   │
          └──────────┬────────┘
                     │
             ┌───────▼────────┐
             │ Astronomy      │
             │ Engine         │
             │ Local Compute  │
             └───────┬────────┘
                     │
        ┌────────────▼─────────────┐
        │ MoonWindow Calculation  │
        │ & Visibility Engine     │
        └────────────┬─────────────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
┌──────▼──────────┐       ┌────────▼────────┐
│ Weather Adapter │       │ Supabase        │
│ Cached Requests │       │ Optional data   │
└─────────────────┘       └─────────────────┘
```

---

# 23. Internal Calculation Model

Create a reusable function:

```ts
type MoonSnapshot = {
  timestamp: Date;
  latitude: number;
  longitude: number;
  altitude: number;
  azimuth: number;
  direction: string;
  illumination: number;
  phaseName: string;
  distanceKm: number;
  aboveHorizon: boolean;
};
```

Main function:

```ts
getMoonSnapshot(
  latitude,
  longitude,
  elevation,
  timestamp
)
```

Also:

```ts
getMoonRiseSet()
getMoonTimeline()
getBestViewingWindow()
getVisibilityScore()
```

Keep these functions independent from React.

This makes them reusable later in:

- Android
- iOS
- backend API
- widgets
- testing tools

---

# 24. Visibility Score

A simple Phase 1 algorithm is sufficient.

Example conceptual scoring:

```text
Start at 100

If Moon below horizon:
  score = 0

Cloud cover:
  subtract 0–55

Very low altitude:
  subtract 0–25

Rain:
  subtract 0–15

Poor atmospheric visibility:
  subtract 0–20

Twilight/daylight:
  apply context adjustment
```

Output categories:

```text
85–100  Excellent
65–84   Good
40–64   Fair
1–39    Poor
0       Below horizon
```

The exact weights should be tuned after comparing predictions with real-world observations.

---

# 25. Ground-Level Limitation

Astronomy can tell us the Moon's geometric position.

It cannot automatically know that a user's view is blocked by:

- apartment building
- hill
- tree
- nearby tower
- balcony wall
- mountain ridge

Phase 1 must make this distinction clear.

Recommended language:

> The Moon is 7° above the astronomical horizon. Nearby buildings, hills or trees may block your view.

Future phases can include terrain/elevation horizon modeling.

---

# 26. Accuracy Trust UI

Display a small trust panel.

Example:

**Position calculation**  
High confidence

**Weather visibility**  
Updated 12 min ago

**Device direction**  
Calibrate phone for best accuracy

**Location accuracy**  
±18 m

This gives users a clear understanding of what is accurate and what may vary.

---

# 27. Location Permission UX

Do not immediately throw the browser permission popup on first render.

First show:

> **See the Moon from your location**  
> MoonWindow uses your location to calculate the exact direction, altitude and rise time of the Moon. Your precise location is not stored by default.

Button:

**Use my location**

Only then request browser permission.

If denied:

**Enter city manually**

---

# 28. Sensor Permission UX

Before orientation/camera permission:

> **Point your phone toward the Moon**  
> We need motion/compass access to guide your direction. Sensor data stays on your device.

Button:

**Start Sky Finder**

Then request the required permission.

---

# 29. Error States

Phase 1 must gracefully support:

### Location denied

Show manual location.

### GPS unavailable

Allow city/manual coordinates.

### Compass unavailable

Show azimuth and cardinal direction.

### Camera denied

Continue using compass-only view.

### Weather provider down

Show:

> Weather visibility unavailable. Moon position remains available.

### Supabase unavailable

Main Moon tracking must continue working.

This separation is essential.

---

# 30. SEO Strategy

Most personalized data is client-generated, but public pages can still rank.

Create useful static/indexable pages such as:

- `/moonrise-today`
- `/moon-direction`
- `/karwa-chauth-moon`
- `/full-moon`
- `/moon-phase`
- `/how-to-find-the-moon`
- `/accuracy`

Do not create thousands of thin auto-generated city pages in Phase 1.

Focus on a few high-quality pages.

---

# 31. Recommended Phase 1 Analytics Events

Track only product decisions that matter.

Suggested:

```text
location_permission_granted
location_permission_denied
moon_result_viewed
find_moon_opened
sky_finder_opened
sky_finder_supported
sky_finder_unsupported
weather_loaded
weather_failed
festival_page_viewed
feedback_submitted
```

Avoid recording a database row every time the compass changes.

---

# 32. Admin Requirements

No full dashboard.

Phase 1 administration can be done directly through:

- Supabase dashboard
- Static configuration in Git

Only build a tiny admin UI when operational work becomes painful.

---

# 33. Security

Minimum Phase 1 requirements:

- HTTPS only
- Supabase Row Level Security
- Never expose Supabase service-role key in frontend
- Public frontend may contain only anon/publishable credentials intended for browser use
- Validate feedback fields
- Apply database rate limits / abuse protection where possible
- Content Security Policy
- No unnecessary third-party scripts
- Sanitize user-generated text
- No raw camera upload
- No secret weather key in frontend if provider prohibits it

If an API requires a secret key, proxy only that request through an edge/serverless function.

---

# 34. Recommended Folder Structure

```text
moonwindow/
│
├── public/
│   ├── icons/
│   ├── manifest.webmanifest
│   └── robots.txt
│
├── src/
│   ├── app/
│   ├── components/
│   │   ├── MoonHero/
│   │   ├── Compass/
│   │   ├── VisibilityCard/
│   │   ├── MoonTimeline/
│   │   └── PermissionPrompt/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── FindMoon/
│   │   ├── SkyFinder/
│   │   ├── MoonDetails/
│   │   └── Accuracy/
│   │
│   ├── astronomy/
│   │   ├── moonPosition.ts
│   │   ├── riseSet.ts
│   │   ├── moonPhase.ts
│   │   └── timeline.ts
│   │
│   ├── sensors/
│   │   ├── geolocation.ts
│   │   ├── orientation.ts
│   │   └── camera.ts
│   │
│   ├── weather/
│   │   ├── types.ts
│   │   ├── provider.ts
│   │   └── cache.ts
│   │
│   ├── visibility/
│   │   └── visibilityScore.ts
│   │
│   ├── storage/
│   │   ├── localPreferences.ts
│   │   └── supabase.ts
│   │
│   ├── festivals/
│   │   └── events.ts
│   │
│   └── styles/
│
├── tests/
│   ├── astronomy/
│   ├── visibility/
│   └── sensors/
│
├── .env.example
├── package.json
└── README.md
```

---

# 35. Environment Variables

Example:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Weather only if needed.
VITE_WEATHER_PROVIDER=openmeteo
```

Never place secret server keys in `VITE_*` variables.

Vite frontend environment values are visible to users.

---

# 36. Testing Requirements

## Unit tests

Test Moon calculations against known locations and dates.

Recommended test locations:

- Delhi
- Mumbai
- Pune
- Chandigarh
- Bengaluru
- Kolkata
- Chennai
- Jaipur

Test:

- Moonrise
- Moonset
- Altitude
- Azimuth
- Phase
- Timezone rendering

---

## Device testing

Must test on:

- Android Chrome
- Samsung Internet
- iPhone Safari
- Desktop Chrome
- Desktop Safari
- Edge

Pay particular attention to:

- iOS orientation permissions
- compass calibration
- camera permission
- landscape/portrait changes
- low-end Android devices

---

# 37. Real-World Validation

Before calling the product accurate:

For at least several nights:

1. Pick multiple locations.
2. Record MoonWindow's predicted rise time.
3. Record azimuth and altitude.
4. Compare with trusted astronomical references.
5. Observe the Moon physically.
6. Record real-world obstruction/weather differences.
7. Adjust UI wording and visibility scoring.

The astronomy engine should be validated separately from the weather visibility score.

---

# 38. Phase 1 Development Order

## Milestone 1 — Core calculation

Build:

- Geolocation
- Moon position
- Moonrise/set
- Phase
- Time formatting

Success:

User can open the site and see correct Moon information.

---

## Milestone 2 — Premium home screen

Build:

- Mobile layout
- Moon card
- Visibility status
- Timeline
- Loading/error states

Success:

The website feels usable and trustworthy.

---

## Milestone 3 — Compass finder

Build:

- Device orientation
- Moon azimuth marker
- Direction correction
- Sensor calibration UX

Success:

User can physically turn toward the Moon.

---

## Milestone 4 — Weather visibility

Build:

- Weather provider interface
- Caching
- Visibility algorithm
- Fallback behavior

Success:

MoonWindow can estimate viewing conditions.

---

## Milestone 5 — Sky Finder Beta

Build:

- Camera view
- Orientation overlay
- Moon direction target
- Compatibility fallback

Success:

User can point the camera and receive directional guidance.

---

## Milestone 6 — Festival landing page

Build:

- Karwa Chauth Moon page
- Location personalization
- SEO metadata
- Share capability

Success:

MoonWindow has its first event-focused acquisition page.

---

## Milestone 7 — Launch hardening

Build/check:

- PWA
- Privacy page
- Accuracy page
- Analytics
- Feedback
- Lighthouse
- Real-device QA
- Error reporting
- SEO
- Production domain

---

# 39. Phase 1 Definition of Done

Phase 1 is complete when a mobile user can:

1. Open `moonwindow.in`.
2. Tap **Use my location**.
3. See Moonrise and Moonset.
4. See whether the Moon is currently above the horizon.
5. See azimuth and altitude.
6. See a simple visibility forecast.
7. Tap **Find the Moon**.
8. Turn their phone in the indicated direction.
9. Optionally open the camera Sky Finder.
10. Understand the confidence/limitations of the prediction.

No account should be required.

---

# 40. Phase 1 Product Success Metrics

Do not focus on vanity traffic alone.

Measure:

- Percentage granting location
- Percentage receiving a Moon result
- Percentage opening Find the Moon
- Percentage opening Sky Finder
- Return users
- Festival-page conversion into Moon finder
- Weather API calls per active user
- Backend cost per 1,000 users
- Page load performance
- User feedback on accuracy

Target architecture objective:

**Core Moon calculations should continue to cost essentially the same whether there are 100 users or 100,000 users, because computation occurs on users' devices.**

---

# 41. Initial Cost Guardrails

Before launch:

- No paid map API
- No Google Maps SDK
- No AI API
- No SMS OTP
- No mandatory login
- No image hosting requirement
- No server continuously calculating Moon positions
- No high-frequency weather polling
- No server-side location history

Set provider usage alerts wherever available.

---

# 42. Phase 1 User Journey

```text
Google / Direct / Shared link
          │
          ▼
     MoonWindow Home
          │
          ▼
 "Use my location"
          │
          ▼
   Moon Status Result
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
Find Moon    View Details
    │
    ▼
Compass Finder
    │
    ▼
Sky Finder Beta
```

---

# 43. Positioning

MoonWindow should be positioned as:

> **Know exactly when and where to look for the Moon.**

Alternative:

> **Your window to the Moon.**

Support line:

> Accurate Moon timing, direction and viewing conditions for your location.

Avoid leading with technical terms like:

- ephemeris
- azimuth engine
- celestial coordinate calculation

Those can live in the Accuracy section.

---

# 44. Phase 1 Homepage Copy

## Hero

**Find the Moon from where you are.**

See when it rises, where to look, how high it will be, and whether the sky is likely to be clear.

CTA:

**Use my location**

Secondary:

**Enter a location**

Privacy line:

**Your precise location is used for the calculation and is not stored by default.**

---

# 45. Trust Principles

MoonWindow should consistently communicate:

### Accuracy

Give exact astronomical values where appropriate.

### Uncertainty

Do not overpromise weather or ground-level visibility.

### Privacy

Location and sensor information should stay on-device whenever possible.

### Simplicity

The user should never need to understand astronomy terminology to find the Moon.

### Cost discipline

Infrastructure should scale slowly even when usage scales quickly.

---

# 46. Recommended Phase 2 Candidates — Not To Build Yet

Only evaluate these after Phase 1 usage:

- Native Android app
- iOS app
- True AR spatial anchoring
- Terrain/horizon obstruction modeling
- User-defined balcony direction
- Saved locations
- Moon alerts
- Festival reminders
- Push notifications
- Widgets
- City pages
- Community sightings
- Moon photo sharing
- Advanced crescent visibility models
- Multi-language support
- Premium subscription

---

# 47. External Services Summary

## Required

### Astronomy Engine

Purpose:
- Moon position and timing calculations

Execution:
- Browser/client

Expected request cost:
- None

---

## Optional but recommended

### Weather provider

Purpose:
- Clouds and atmospheric viewing conditions

Execution:
- Cached API request

Design requirement:
- Provider must be replaceable.

---

### Supabase

Purpose:
- Small persistent app data

Phase 1:
- Feedback
- Optional analytics
- Festival configuration

Do not use it as the computation engine.

---

### Cloudflare

Purpose:
- Website/CDN/deployment

Architecture:
- Static-first

---

# 48. Current Service Notes (verified November 2026)

These are implementation-planning notes and should be rechecked before production procurement.

### Astronomy Engine

- Open source
- MIT licence
- Browser/JavaScript support
- Can calculate horizon-based Moon position, rise/set, phase and related astronomical data locally
- Designed to be compact and dependency-free

Source:
https://github.com/cosinekitty/astronomy

### Supabase

Current Free plan publicly lists:

- $0/month entry tier
- 500 MB database per project
- 50,000 monthly active users
- 5 GB egress
- 1 GB file storage
- 2 active free projects
- Free projects may pause after inactivity

Source:
https://supabase.com/pricing

### Cloudflare Pages

Current documentation states that static asset requests on both free and paid Pages plans are free and unlimited.

Source:
https://developers.cloudflare.com/pages/functions/pricing/

### Open-Meteo

Current public free/open-access API is intended for non-commercial use/evaluation and has request limits. Commercial production usage should use an appropriate commercial licence/plan or alternate provider.

Source:
https://open-meteo.com/en/pricing

---

# 49. Final Phase 1 Architecture Decision

Use:

**React + TypeScript + Vite + Astronomy Engine + browser location/orientation/camera APIs + cached weather adapter + optional Supabase + static Cloudflare hosting.**

Avoid:

**server-side astronomy calculations, paid maps, authentication, heavy AR frameworks, AI APIs, large databases and high-frequency weather requests.**

This is the strongest Phase 1 balance between:

- Accuracy
- Premium UX
- Mobile performance
- Privacy
- Development speed
- Future scalability
- Very low recurring cost

---

# 50. One-Sentence Engineering Rule

> **If MoonWindow can calculate something safely on the user's device, do not pay a server to calculate it.**

---

## End of Phase 1 specification

**Next artifact after this document:** implementation repository scaffold and UI design system — only after the Phase 1 scope above is accepted.

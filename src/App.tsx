import { useEffect, useMemo, useRef, useState } from 'react'
import { getMoonSnapshot, getTimeline, nextMajorPhase } from './astronomy'
import { getWeather, visibility } from './weather'
import type { LocationState, Weather } from './types'

const DEFAULT_LOCATION: LocationState = { latitude: 28.6139, longitude: 77.209, label: 'New Delhi' }
const cities: Record<string, LocationState> = {
  'New Delhi': DEFAULT_LOCATION, Mumbai: { latitude: 19.076, longitude: 72.8777, label: 'Mumbai' },
  Bengaluru: { latitude: 12.9716, longitude: 77.5946, label: 'Bengaluru' }, Pune: { latitude: 18.5204, longitude: 73.8567, label: 'Pune' },
  Kolkata: { latitude: 22.5726, longitude: 88.3639, label: 'Kolkata' }, Chennai: { latitude: 13.0827, longitude: 80.2707, label: 'Chennai' },
  Jaipur: { latitude: 26.9124, longitude: 75.7873, label: 'Jaipur' }
}

const formatTime = (date?: Date) => date ? new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(date) : '—'
const formatDate = (date: Date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date)

function Logo() { return <a className="logo" href="/" aria-label="MoonWindow home"><span>◐</span> MoonWindow</a> }
function Header() { return <header><Logo /><nav><a href="/moon">Details</a><a href="/accuracy">Accuracy</a></nav></header> }
function Footer() { return <footer><Logo /><p>Your window to the Moon.</p><div><a href="/accuracy">Accuracy</a><a href="/privacy">Privacy</a></div><small>© 2026 MoonWindow · Astronomy is calculated on your device.</small></footer> }

function LocationBar({ location, setLocation }: { location: LocationState; setLocation: (l: LocationState) => void }) {
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const useLocation = () => {
    setBusy(true); setError('')
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => { setLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, label: 'Current location' }); setBusy(false); setOpen(false) },
      () => { setError('Location unavailable. Choose a city instead.'); setBusy(false); setOpen(true) }, { enableHighAccuracy: true, timeout: 10000 })
  }
  return <div className="location-wrap">
    <button className="location-pill" onClick={() => setOpen(v => !v)}><span>⌖</span><b>{location.label}</b><small>{location.accuracy ? `±${Math.round(location.accuracy)} m` : 'Tap to change'}</small><i>⌄</i></button>
    {open && <div className="location-popover"><button className="button dark" onClick={useLocation} disabled={busy}>{busy ? 'Finding you…' : 'Use my location'}</button><p className="divider">or choose a city</p><select aria-label="Choose city" value={location.label in cities ? location.label : ''} onChange={e => setLocation(cities[e.target.value])}><option value="" disabled>Select city</option>{Object.keys(cities).map(city => <option key={city}>{city}</option>)}</select>{error && <p className="error">{error}</p>}<small>Precise coordinates stay in this browser.</small></div>}
  </div>
}

function MoonArt({ illumination = 70 }: { illumination?: number }) { return <div className="moon-art" style={{ '--illumination': illumination } as React.CSSProperties}><div className="moon-crater one"/><div className="moon-crater two"/><div className="moon-crater three"/></div> }

function Home({ location, setLocation, weather }: { location: LocationState; setLocation: (l: LocationState) => void; weather?: Weather }) {
  const snapshot = getMoonSnapshot(location); const timeline = getTimeline(location); const view = visibility(snapshot, weather)
  const status = snapshot.aboveHorizon ? (snapshot.altitude < 8 ? 'Low above the horizon' : 'Above the horizon') : `Rises at ${formatTime(snapshot.rise)}`
  return <><Header /><main><LocationBar location={location} setLocation={setLocation} />
    <section className="hero-grid">
      <article className="hero-card">
        <div className="eyebrow"><span className={`status-dot ${snapshot.aboveHorizon ? 'live' : ''}`}/>{status}</div>
        <div className="hero-content"><div><p className="phase">{snapshot.phaseName}</p><h1>{snapshot.aboveHorizon ? `${Math.round(snapshot.altitude)}° high` : 'Not risen yet'}</h1><p className="look">Look <b>{snapshot.direction} · {Math.round(snapshot.azimuth)}°</b></p></div><MoonArt illumination={snapshot.illumination}/></div>
        <div className="hero-stats"><div><span>Moonrise</span><b>{formatTime(snapshot.rise)}</b></div><div><span>Moonset</span><b>{formatTime(snapshot.set)}</b></div><div><span>Visibility</span><b className="good">● {view.label}</b></div></div>
        <a className="button gold" href="/find">Find the Moon <span>→</span></a>
      </article>
      <article className="path-card"><div className="card-head"><div><p className="kicker">Tonight’s path</p><h2>Follow it across the sky</h2></div><span className="weather-badge">{weather ? `${weather.cloudCover}% clouds` : 'Weather offline'}</span></div>
        <div className="sky-path"><div className="path-line"/><span className="horizon-label">Horizon</span>{timeline.slice(0,5).map((item,i) => <div key={i} className="path-point" style={{ left: `${8 + i*21}%`, bottom: `${Math.max(12, Math.min(76, 18 + item.altitude))}%` }}><i className={i===0 ? 'active' : ''}>●</i><b>{formatTime(item.timestamp)}</b><small>{Math.round(item.altitude)}° · {item.direction}</small></div>)}</div>
      </article>
    </section>
    <section className="section"><div className="section-title"><div><p className="kicker">Next hours</p><h2>Your viewing window</h2></div><p>Local calculation · updates every minute</p></div><div className="timeline">{timeline.map((item,i) => { const v = visibility(item, weather); return <article key={i} className={i===0 ? 'now' : ''}><span>{i===0 ? 'Now' : formatTime(item.timestamp)}</span><strong>{Math.round(item.altitude)}°</strong><p>{item.direction} · {Math.round(item.azimuth)}°</p><small className={v.score>64?'good':''}>● {v.label}</small></article> })}</div></section>
    <section className="feature-grid"><article className="visibility-card"><p className="kicker">Viewing conditions</p><div className="score-row"><div className="score-ring" style={{'--score': `${view.score * 3.6}deg`} as React.CSSProperties}><b>{view.score}</b><small>/100</small></div><div><h2>{view.label} chance of visibility</h2><p>{weather ? `${weather.cloudCover}% cloud cover · ${weather.humidity}% humidity` : 'Moon position is available. Weather could not be loaded.'}</p></div></div><div className="condition-row"><span>Position calculation <b>High confidence</b></span><span>Weather <b>{weather ? 'Updated now' : 'Unavailable'}</b></span><span>Location <b>{location.accuracy ? `±${Math.round(location.accuracy)} m` : 'City centre'}</b></span></div></article>
      <article className="occasion-card"><span className="occasion-orbit">◐</span><p className="kicker">Occasion guide</p><h2>Karwa Chauth Moon</h2><p>Location-aware moonrise, direction and weather guidance for your evening.</p><a href="/karwa-chauth-moon">Open guide →</a><small>Astronomical estimates are not official religious declarations.</small></article></section>
    <section className="details-strip"><div><p className="kicker">Tonight’s Moon</p><h2>{snapshot.phaseName}</h2><p>{snapshot.illumination.toFixed(0)}% illuminated from {Math.round(snapshot.distanceKm).toLocaleString('en-IN')} km away.</p></div><MoonArt illumination={snapshot.illumination}/><a className="text-link" href="/moon">View all details →</a></section>
    <section className="explain"><p className="kicker">Simple, private, precise</p><h2>Everything you need to look up.</h2><div><article><span>01</span><h3>On-device astronomy</h3><p>Your phone calculates the Moon’s position locally. No account or location history.</p></article><article><span>02</span><h3>Weather-aware</h3><p>A measured confidence score combines altitude and current sky conditions.</p></article><article><span>03</span><h3>Point and find</h3><p>Use the compass or camera guidance to turn toward the Moon.</p></article></div></section>
  </main><Footer /></>
}

function Compass({ location, camera = false }: { location: LocationState; camera?: boolean }) {
  const snapshot = getMoonSnapshot(location); const [heading, setHeading] = useState(0); const [started, setStarted] = useState(false); const video = useRef<HTMLVideoElement>(null)
  const delta = ((snapshot.azimuth - heading + 540) % 360) - 180
  const startSensors = async () => {
    const D = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> }
    if (D.requestPermission) await D.requestPermission()
    window.addEventListener('deviceorientation', (event) => { const ios = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading; setHeading(ios ?? (event.alpha ? 360-event.alpha : 0)) })
    if (camera) { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); if (video.current) { video.current.srcObject = stream; await video.current.play() } }
    setStarted(true)
  }
  return <div className={camera ? 'sky-page' : 'finder-page'}>{camera && <video ref={video} muted playsInline className="camera"/>}<div className="finder-overlay"><a className="back" href={camera?'/find':'/'}>←</a><Logo/><span className="beta">{camera?'Sky Finder · Beta':'Live compass'}</span>
    {!started ? <div className="sensor-prompt"><MoonArt illumination={snapshot.illumination}/><h1>{camera?'Point your phone toward the Moon':'Turn toward the Moon'}</h1><p>Motion, compass{camera?' and camera':''} access helps guide your direction. Sensor data stays on this device.</p><button className="button gold" onClick={() => startSensors().catch(() => setStarted(true))}>Start {camera?'Sky Finder':'compass'} →</button></div> : <>
      <div className="guide-copy"><p>{Math.abs(delta) < 8 ? 'You’re facing the Moon' : `Turn ${Math.abs(Math.round(delta))}° ${delta > 0 ? 'right' : 'left'}`}</p><h1>{snapshot.direction} · {Math.round(snapshot.azimuth)}°</h1><small>{Math.round(snapshot.altitude)}° above the horizon</small></div>
      <div className="compass" style={{ transform: `rotate(${-heading}deg)` }}><span className="n">N</span><span className="e">E</span><span className="s">S</span><span className="w">W</span><div className="moon-marker" style={{ transform: `rotate(${snapshot.azimuth}deg) translateY(-132px)` }}><i>●</i></div><div className="needle"/></div>
      <div className="calibration">∞ Move your phone in a figure eight to calibrate</div></>}
    {!camera && <a className="camera-button" href="/sky">▣ Open camera view</a>}</div></div>
}

function Details({ location }: { location: LocationState }) { const s = getMoonSnapshot(location); const q = nextMajorPhase(); return <><Header/><main className="content-page"><p className="kicker">Moon details</p><h1>{s.phaseName}</h1><p className="lede">A precise astronomical snapshot for {location.label}, calculated on your device.</p><div className="detail-hero"><MoonArt illumination={s.illumination}/><div><strong>{s.illumination.toFixed(1)}%</strong><span>illuminated</span></div></div><div className="detail-grid">{[['Altitude',`${s.altitude.toFixed(1)}°`],['Azimuth',`${s.azimuth.toFixed(1)}° ${s.direction}`],['Moonrise',formatTime(s.rise)],['Moonset',formatTime(s.set)],['Distance',`${Math.round(s.distanceKm).toLocaleString('en-IN')} km`],['Next phase',`${q.name} · ${formatDate(q.date)}`]].map(([k,v])=><article key={k}><span>{k}</span><b>{v}</b></article>)}</div><a className="button gold" href="/find">Find the Moon →</a></main><Footer/></> }

function InfoPage({ privacy = false }: { privacy?: boolean }) { return <><Header/><main className="content-page"><p className="kicker">{privacy?'Privacy':'Accuracy & trust'}</p><h1>{privacy?'Your sky data stays yours.':'Built to be precise. Honest about limits.'}</h1><p className="lede">{privacy?'MoonWindow uses location, camera and orientation only to guide you.':'Astronomy gives us a precise geometric position. Your real-world view can still vary.'}</p><div className="prose-grid">{(privacy ? [['Location','Exact coordinates remain in browser memory and are not saved by default. Weather requests use rounded coordinates.'],['Camera','The live camera feed never leaves your device and no images are recorded.'],['Sensors','Compass and motion data are read only while the finder is open.'],['Storage','A small local cache stores recent weather and preferences. Clear site data to remove it.']] : [['Astronomical position','Moon altitude, azimuth, phase, rise and set are calculated locally using Astronomy Engine.'],['Weather confidence','Clouds, precipitation and atmospheric visibility affect a probabilistic score—not a guarantee.'],['Device direction','Phone compasses can drift near metal or magnets. Calibrate with a figure-eight movement.'],['Ground obstructions','Buildings, hills and trees can block a Moon that is geometrically above the horizon.']]).map(([h,p])=><article key={h}><h2>{h}</h2><p>{p}</p></article>)}</div><a className="button dark" href="/">Back to Moon status</a></main><Footer/></> }

function Festival({ location }: { location: LocationState }) { const s=getMoonSnapshot(location); return <><Header/><main className="festival-page"><p className="kicker">MoonWindow occasion guide</p><h1>Karwa Chauth Moon</h1><p className="lede">Know when the Moon rises and exactly where to look from {location.label}.</p><div className="festival-result"><MoonArt illumination={s.illumination}/><div><span>Estimated moonrise</span><strong>{formatTime(s.rise)}</strong><p>Look {s.direction} · {Math.round(s.azimuth)}°</p><a className="button gold" href="/find">Find the Moon →</a></div></div><aside>Astronomical calculations may differ from local panchang timings or official religious observations. Follow your local tradition or authority for observance.</aside></main><Footer/></> }

export default function App() {
  const [location, setLocation] = useState<LocationState>(() => { try { return JSON.parse(localStorage.getItem('mw-location') || '') } catch { return DEFAULT_LOCATION } })
  const [weather, setWeather] = useState<Weather>(); const [, tick] = useState(0)
  useEffect(() => { localStorage.setItem('mw-location', JSON.stringify(location)); getWeather(location).then(setWeather).catch(()=>setWeather(undefined)) }, [location])
  useEffect(() => { const id=setInterval(()=>tick(v=>v+1),60000); return()=>clearInterval(id) }, [])
  const path = useMemo(() => window.location.pathname.replace(/\/$/,'') || '/', [])
  if (path === '/find') return <Compass location={location}/>
  if (path === '/sky') return <Compass location={location} camera/>
  if (path === '/moon') return <Details location={location}/>
  if (path === '/accuracy') return <InfoPage/>
  if (path === '/privacy') return <InfoPage privacy/>
  if (path === '/karwa-chauth-moon') return <Festival location={location}/>
  return <Home location={location} setLocation={setLocation} weather={weather}/>
}

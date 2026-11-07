import type { LocationState, Weather } from './types'

const TTL = 20 * 60 * 1000
export async function getWeather(location: LocationState): Promise<Weather> {
  const key = `mw-weather:${location.latitude.toFixed(2)}:${location.longitude.toFixed(2)}`
  const cached = localStorage.getItem(key)
  if (cached) { const value = JSON.parse(cached) as Weather; if (Date.now() - value.fetchedAt < TTL) return value }
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(location.latitude)); url.searchParams.set('longitude', String(location.longitude))
  url.searchParams.set('current', 'cloud_cover,precipitation,relative_humidity_2m,visibility'); url.searchParams.set('forecast_days', '1')
  const response = await fetch(url); if (!response.ok) throw new Error('Weather unavailable')
  const data = await response.json(); const current = data.current
  const value = { cloudCover: current.cloud_cover ?? 0, precipitation: current.precipitation ?? 0,
    visibility: current.visibility ?? 10000, humidity: current.relative_humidity_2m ?? 0, fetchedAt: Date.now() }
  localStorage.setItem(key, JSON.stringify(value)); return value
}

export function visibility(snapshot: { aboveHorizon: boolean; altitude: number }, weather?: Weather) {
  if (!snapshot.aboveHorizon) return { score: 0, label: 'Moon below horizon' }
  let score = 100
  if (weather) { score -= weather.cloudCover * .55; score -= Math.min(weather.precipitation * 15, 15); if (weather.visibility < 5000) score -= 15 }
  if (snapshot.altitude < 5) score -= 25; else if (snapshot.altitude < 12) score -= 12
  score = Math.max(1, Math.round(score))
  return { score, label: score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 40 ? 'Fair' : 'Poor' }
}

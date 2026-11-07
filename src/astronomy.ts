import * as Astronomy from 'astronomy-engine'
import type { LocationState, MoonSnapshot } from './types'

const AU_KM = 149_597_870.7
const directions = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']

export function directionFor(degrees: number) { return directions[Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16] }
export function phaseName(angle: number) {
  if (angle < 11.25 || angle >= 348.75) return 'New Moon'
  if (angle < 78.75) return 'Waxing Crescent'
  if (angle < 101.25) return 'First Quarter'
  if (angle < 168.75) return 'Waxing Gibbous'
  if (angle < 191.25) return 'Full Moon'
  if (angle < 258.75) return 'Waning Gibbous'
  if (angle < 281.25) return 'Last Quarter'
  return 'Waning Crescent'
}

export function getMoonSnapshot(location: LocationState, date = new Date()): MoonSnapshot {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, 0)
  const equator = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true)
  const horizon = Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal')
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date)
  const angle = Astronomy.MoonPhase(date)
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, date, 2)?.date
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, date, 2)?.date
  return { timestamp: date, latitude: location.latitude, longitude: location.longitude, altitude: horizon.altitude,
    azimuth: horizon.azimuth, direction: directionFor(horizon.azimuth), illumination: illumination.phase_fraction * 100,
    phaseName: phaseName(angle), distanceKm: equator.dist * AU_KM, aboveHorizon: horizon.altitude > 0, rise, set }
}

export function getTimeline(location: LocationState, hours = 6) {
  return Array.from({ length: hours }, (_, i) => getMoonSnapshot(location, new Date(Date.now() + i * 60 * 60 * 1000)))
}

export function nextMajorPhase(date = new Date()) {
  const quarter = Astronomy.SearchMoonQuarter(date)
  return { name: ['New Moon','First Quarter','Full Moon','Last Quarter'][quarter.quarter], date: quarter.time.date }
}

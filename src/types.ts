export type LocationState = { latitude: number; longitude: number; accuracy?: number; label: string }
export type Weather = { cloudCover: number; precipitation: number; visibility: number; humidity: number; fetchedAt: number }
export type MoonSnapshot = {
  timestamp: Date; latitude: number; longitude: number; altitude: number; azimuth: number; direction: string;
  illumination: number; phaseName: string; distanceKm: number; aboveHorizon: boolean; rise?: Date; set?: Date;
}

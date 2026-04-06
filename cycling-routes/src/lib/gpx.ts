import { gpx } from '@tmcw/togeojson'
import type { GpxTrack } from '@/types'

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function parseGpx(gpxString: string): GpxTrack {
  const parser = new DOMParser()
  const doc = parser.parseFromString(gpxString, 'text/xml')
  const geoJson = gpx(doc)

  const feature = geoJson.features.find(
    (f) => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString',
  )

  if (!feature) throw new Error('No track found in GPX file')

  let coords: number[][]
  if (feature.geometry.type === 'LineString') {
    coords = feature.geometry.coordinates as number[][]
  } else {
    // MultiLineString — flatten segments
    coords = (feature.geometry.coordinates as number[][][]).flat()
  }

  const coordinates: [number, number][] = coords.map(([lng, lat]) => [lng, lat])
  const elevations: number[] = coords.map((c) => c[2] ?? 0)

  let distanceKm = 0
  let elevationGain = 0
  for (let i = 1; i < coordinates.length; i++) {
    const [lng1, lat1] = coordinates[i - 1]
    const [lng2, lat2] = coordinates[i]
    distanceKm += haversineKm(lat1, lng1, lat2, lng2)
    const rise = (elevations[i] ?? 0) - (elevations[i - 1] ?? 0)
    if (rise > 0) elevationGain += rise
  }

  const name =
    (feature.properties as { name?: string })?.name ||
    doc.querySelector('name')?.textContent ||
    'Unnamed Route'

  return {
    name,
    coordinates,
    elevations,
    distanceKm: Math.round(distanceKm * 10) / 10,
    elevationGain: Math.round(elevationGain),
  }
}

export function gpxBounds(coordinates: [number, number][]): [[number, number], [number, number]] {
  const lats = coordinates.map(([, lat]) => lat)
  const lngs = coordinates.map(([lng]) => lng)
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ]
}

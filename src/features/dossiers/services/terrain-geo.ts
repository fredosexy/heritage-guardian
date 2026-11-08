export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface TerrainMeasurements {
  perimeterMeters: number;
  segmentDistancesMeters: number[];
  areaSquareMeters: number;
  areaHectares: number;
  areaAres: number;
  method: "spherical-haversine";
  vertexCount: number;
}

export const EARTH_MEAN_RADIUS_METERS = 6_371_008.8;

export function isValidGeoPoint(point: GeoPoint): boolean {
  return Number.isFinite(point.latitude)
    && Number.isFinite(point.longitude)
    && point.latitude >= -90
    && point.latitude <= 90
    && point.longitude >= -180
    && point.longitude <= 180;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Approximate great-circle distance on a mean-radius sphere. */
export function distanceBetweenPointsMeters(a: GeoPoint, b: GeoPoint): number {
  if (!isValidGeoPoint(a) || !isValidGeoPoint(b)) {
    throw new Error("Coordonnées géographiques invalides");
  }

  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = lat2 - lat1;
  const deltaLon = toRadians(b.longitude - a.longitude);
  const haversine = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const centralAngle = 2 * Math.atan2(
    Math.sqrt(Math.min(1, haversine)),
    Math.sqrt(Math.max(0, 1 - haversine)),
  );
  return EARTH_MEAN_RADIUS_METERS * centralAngle;
}

/**
 * Calculates an indicative perimeter and spherical polygon area.
 * Points must describe one simple ring in traversal order (at least 3 distinct points).
 * The ring is closed implicitly; do not repeat the first point at the end.
 */
export function calculateTerrainMeasurements(points: readonly GeoPoint[]): TerrainMeasurements {
  if (points.length < 3) {
    throw new Error("Au moins trois sommets sont nécessaires pour calculer une superficie");
  }
  if (points.some((point) => !isValidGeoPoint(point))) {
    throw new Error("Le contour contient des coordonnées invalides");
  }

  const distinct = new Set(points.map((point) => `${point.latitude.toFixed(10)},${point.longitude.toFixed(10)}`));
  if (distinct.size < 3) {
    throw new Error("Le contour doit contenir au moins trois sommets distincts");
  }

  let perimeterMeters = 0;
  const segmentDistancesMeters: number[] = [];
  let signedAreaAccumulator = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const segmentDistance = distanceBetweenPointsMeters(current, next);
    segmentDistancesMeters.push(segmentDistance);
    perimeterMeters += segmentDistance;

    const deltaLongitude = toRadians(next.longitude - current.longitude);
    signedAreaAccumulator += deltaLongitude
      * (2 + Math.sin(toRadians(current.latitude)) + Math.sin(toRadians(next.latitude)));
  }

  const areaSquareMeters = Math.abs(signedAreaAccumulator * EARTH_MEAN_RADIUS_METERS ** 2 / 2);
  if (!Number.isFinite(areaSquareMeters) || areaSquareMeters <= 0 || perimeterMeters <= 0) {
    throw new Error("Le contour ne permet pas de calculer une superficie exploitable");
  }

  return {
    perimeterMeters,
    segmentDistancesMeters,
    areaSquareMeters,
    areaHectares: areaSquareMeters / 10_000,
    areaAres: areaSquareMeters / 100,
    method: "spherical-haversine",
    vertexCount: points.length,
  };
}

export function squareMetersToHectares(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error("Superficie invalide");
  return value / 10_000;
}

export function hectaresToSquareMeters(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error("Superficie invalide");
  return value * 10_000;
}

export function squareMetersToAres(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error("Superficie invalide");
  return value / 100;
}

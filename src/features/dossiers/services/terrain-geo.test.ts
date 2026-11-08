import { describe, expect, it } from "vitest";
import {
  calculateTerrainMeasurements,
  distanceBetweenPointsMeters,
  hectaresToSquareMeters,
  isValidGeoPoint,
  squareMetersToAres,
  squareMetersToHectares,
} from "./terrain-geo";

describe("terrain geographic calculations", () => {
  it("validates latitude and longitude ranges", () => {
    expect(isValidGeoPoint({ latitude: 4.05, longitude: 9.7 })).toBe(true);
    expect(isValidGeoPoint({ latitude: 91, longitude: 9.7 })).toBe(false);
    expect(isValidGeoPoint({ latitude: 4.05, longitude: 181 })).toBe(false);
    expect(isValidGeoPoint({ latitude: Number.NaN, longitude: 9.7 })).toBe(false);
  });

  it("returns zero for the distance from a point to itself", () => {
    const point = { latitude: 4.05, longitude: 9.7 };
    expect(distanceBetweenPointsMeters(point, point)).toBe(0);
  });

  it("calculates a reproducible great-circle distance", () => {
    const distance = distanceBetweenPointsMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    );
    expect(distance).toBeGreaterThan(111_000);
    expect(distance).toBeLessThan(112_000);
  });

  it("calculates perimeter and area for a small rectangular ring", () => {
    const result = calculateTerrainMeasurements([
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.001 },
      { latitude: 0.001, longitude: 0.001 },
      { latitude: 0.001, longitude: 0 },
    ]);
    expect(result.vertexCount).toBe(4);
    expect(result.perimeterMeters).toBeGreaterThan(400);
    expect(result.perimeterMeters).toBeLessThan(450);
    expect(result.areaSquareMeters).toBeGreaterThan(12_000);
    expect(result.areaSquareMeters).toBeLessThan(13_000);
    expect(result.areaHectares).toBeCloseTo(result.areaSquareMeters / 10_000);
    expect(result.method).toBe("spherical-haversine");
  });

  it("rejects incomplete or degenerate contours", () => {
    expect(() => calculateTerrainMeasurements([
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    ])).toThrow(/trois sommets/);
    expect(() => calculateTerrainMeasurements([
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
      { latitude: 0, longitude: 0 },
    ])).toThrow(/distincts/);
  });

  it("converts square metres, hectares and ares", () => {
    expect(squareMetersToHectares(10_000)).toBe(1);
    expect(hectaresToSquareMeters(1)).toBe(10_000);
    expect(squareMetersToAres(100)).toBe(1);
  });
});

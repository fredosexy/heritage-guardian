import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import type { GeoPoint } from "../services/terrain-geo";

const MAPLIBRE_MODULE_URL = "https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.mjs";
const MAPLIBRE_CSS_URL = "https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.css";

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, never>;
    geometry:
      | { type: "LineString"; coordinates: number[][] }
      | { type: "Polygon"; coordinates: number[][][] }
      | { type: "Point"; coordinates: number[] };
  }>;
};

type MapSource = { setData: (data: GeoJsonFeatureCollection) => void };
type MapInstance = {
  on: (event: string, callback: (event: any) => void) => void;
  addSource: (id: string, source: Record<string, unknown>) => void;
  addLayer: (layer: Record<string, unknown>) => void;
  getSource: (id: string) => MapSource | undefined;
  addControl: (control: unknown, position?: string) => void;
  remove: () => void;
};

interface TerrainBoundaryMapProps {
  boundaryPoints: GeoPoint[];
  referencePoint?: GeoPoint;
  onBoundaryChange: (points: GeoPoint[]) => void;
}

function makeBoundaryCollection(points: GeoPoint[]): GeoJsonFeatureCollection {
  const coordinates = points.map((point) => [point.longitude, point.latitude]);
  const features: GeoJsonFeatureCollection["features"] = [];
  if (coordinates.length >= 2) {
    features.push({
      type: "Feature",
      properties: {},
      geometry: coordinates.length >= 3
        ? { type: "Polygon", coordinates: [[...coordinates, coordinates[0]]] }
        : { type: "LineString", coordinates },
    });
  }
  return { type: "FeatureCollection", features };
}

function makeReferenceCollection(point?: GeoPoint): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: point ? [{
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
    }] : [],
  };
}

export function TerrainBoundaryMap({
  boundaryPoints,
  referencePoint,
  onBoundaryChange,
}: TerrainBoundaryMapProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const latestPointsRef = useRef(boundaryPoints);
  const onChangeRef = useRef(onBoundaryChange);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState("");
  const styleUrl = import.meta.env.VITE_TERRAIN_MAP_STYLE_URL as string | undefined;

  useEffect(() => {
    latestPointsRef.current = boundaryPoints;
  }, [boundaryPoints]);

  useEffect(() => {
    onChangeRef.current = onBoundaryChange;
  }, [onBoundaryChange]);

  useEffect(() => {
    if (!styleUrl || !containerRef.current) return;
    let disposed = false;
    let map: MapInstance | null = null;

    const loadMap = async () => {
      try {
        if (!document.querySelector('link[data-heritis-maplibre="true"]')) {
          const stylesheet = document.createElement("link");
          stylesheet.rel = "stylesheet";
          stylesheet.href = MAPLIBRE_CSS_URL;
          stylesheet.dataset.heritisMaplibre = "true";
          document.head.appendChild(stylesheet);
        }

        const maplibre = await import(/* @vite-ignore */ MAPLIBRE_MODULE_URL) as unknown as {
          Map: new (options: Record<string, unknown>) => MapInstance;
          NavigationControl: new () => unknown;
        };
        if (disposed || !containerRef.current) return;

        map = new maplibre.Map({
          container: containerRef.current,
          style: styleUrl,
          center: referencePoint
            ? [referencePoint.longitude, referencePoint.latitude]
            : boundaryPoints[0]
              ? [boundaryPoints[0].longitude, boundaryPoints[0].latitude]
              : [12.3547, 5.9631],
          zoom: referencePoint || boundaryPoints.length ? 15 : 6,
          attributionControl: true,
          cooperativeGestures: true,
        });
        mapRef.current = map;
        map.addControl(new maplibre.NavigationControl(), "top-right");
        map.on("load", () => {
          if (disposed || !map) return;
          map.addSource("terrain-boundary", {
            type: "geojson",
            data: makeBoundaryCollection(latestPointsRef.current),
          });
          map.addLayer({
            id: "terrain-boundary-fill",
            type: "fill",
            source: "terrain-boundary",
            filter: ["==", ["geometry-type"], "Polygon"],
            paint: { "fill-color": "#B69A62", "fill-opacity": 0.2 },
          });
          map.addLayer({
            id: "terrain-boundary-line",
            type: "line",
            source: "terrain-boundary",
            paint: { "line-color": "#173D32", "line-width": 3 },
          });
          map.addSource("terrain-reference", {
            type: "geojson",
            data: makeReferenceCollection(referencePoint),
          });
          map.addLayer({
            id: "terrain-reference-point",
            type: "circle",
            source: "terrain-reference",
            paint: {
              "circle-radius": 7,
              "circle-color": "#B69A62",
              "circle-stroke-color": "#FFFFFF",
              "circle-stroke-width": 2,
            },
          });
          setLoaded(true);
        });
        map.on("click", (event) => {
          onChangeRef.current([
            ...latestPointsRef.current,
            { latitude: event.lngLat.lat, longitude: event.lngLat.lng },
          ]);
        });
        map.on("error", () => {
          if (!disposed) setMapError(t("create.terrainGeo.mapLoadError"));
        });
      } catch {
        if (!disposed) setMapError(t("create.terrainGeo.mapLoadError"));
      }
    };

    void loadMap();
    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
      setLoaded(false);
    };
  // The map instance is intentionally initialized once per configured style.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleUrl]);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    mapRef.current.getSource("terrain-boundary")?.setData(makeBoundaryCollection(boundaryPoints));
    mapRef.current.getSource("terrain-reference")?.setData(makeReferenceCollection(referencePoint));
  }, [boundaryPoints, referencePoint, loaded]);

  if (!styleUrl) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        {t("create.terrainGeo.mapNotConfigured")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="h-72 w-full overflow-hidden rounded-2xl border border-border bg-muted" role="application" aria-label={t("create.terrainGeo.mapLabel")} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{t("create.terrainGeo.mapPointCount", { count: boundaryPoints.length })}</p>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={!boundaryPoints.length} onClick={() => onBoundaryChange(boundaryPoints.slice(0, -1))}>
            {t("create.terrainGeo.undoVertex")}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={!boundaryPoints.length} onClick={() => onBoundaryChange([])}>
            {t("create.terrainGeo.clearContour")}
          </Button>
        </div>
      </div>
      {mapError && <p className="text-xs text-destructive" role="alert">{mapError}</p>}
      <p className="text-xs text-muted-foreground">{t("create.terrainGeo.mapTapHint")}</p>
    </div>
  );
}

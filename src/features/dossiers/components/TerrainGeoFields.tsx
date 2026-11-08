import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, LocateFixed, Calculator, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TerrainBoundaryMap } from "./TerrainBoundaryMap";
import {
  calculateTerrainMeasurements,
  isValidGeoPoint,
  type GeoPoint,
  type TerrainMeasurements,
} from "../services/terrain-geo";

export interface TerrainGeospatialData {
  point?: GeoPoint & {
    source: "device_gps" | "manual";
    accuracyMeters?: number | null;
    capturedAt: string;
  };
  boundaryPoints: GeoPoint[];
  measurements?: TerrainMeasurements;
  declaredArea?: { value: number; unit: "m2" | "are" | "ha" };
}

interface TerrainGeoFieldsProps {
  value: TerrainGeospatialData;
  onChange: (value: TerrainGeospatialData) => void;
  disabled?: boolean;
}

function formatPoint(point: GeoPoint): string {
  return `${point.latitude}, ${point.longitude}`;
}

export function TerrainGeoFields({ value, onChange, disabled = false }: TerrainGeoFieldsProps) {
  const { t } = useTranslation();
  const [latitude, setLatitude] = useState(value.point ? String(value.point.latitude) : "");
  const [longitude, setLongitude] = useState(value.point ? String(value.point.longitude) : "");
  const [contourText, setContourText] = useState(value.boundaryPoints.map(formatPoint).join("\n"));
  const [declaredAreaValue, setDeclaredAreaValue] = useState(value.declaredArea ? String(value.declaredArea.value) : "");
  const [declaredAreaUnit, setDeclaredAreaUnit] = useState<"m2" | "are" | "ha">(value.declaredArea?.unit ?? "m2");
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");
  const [measurementError, setMeasurementError] = useState("");

  useEffect(() => {
    setLatitude(value.point ? String(value.point.latitude) : "");
    setLongitude(value.point ? String(value.point.longitude) : "");
    setContourText(value.boundaryPoints.map(formatPoint).join("\n"));
    setDeclaredAreaValue(value.declaredArea ? String(value.declaredArea.value) : "");
    setDeclaredAreaUnit(value.declaredArea?.unit ?? "m2");
  }, [value.point?.latitude, value.point?.longitude, value.boundaryPoints, value.declaredArea?.value, value.declaredArea?.unit]);

  const parsedPoints = useMemo(() => {
    const lines = contourText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return lines.map((line) => {
      const parts = line.split(/[;,]/).map((part) => part.trim());
      if (parts.length !== 2 || parts.some((part) => !part)) return null;
      return { latitude: Number(parts[0]), longitude: Number(parts[1]) };
    });
  }, [contourText]);

  const captureLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError(t("create.terrainGeo.gpsUnsupported"));
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: "device_gps" as const,
          accuracyMeters: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          capturedAt: new Date(position.timestamp).toISOString(),
        };
        setLatitude(String(point.latitude));
        setLongitude(String(point.longitude));
        onChange({ ...value, point, measurements: value.measurements });
        setCapturing(false);
      },
      (geoError) => {
        setError(geoError.code === geoError.PERMISSION_DENIED
          ? t("create.terrainGeo.gpsDenied")
          : geoError.code === geoError.TIMEOUT
            ? t("create.terrainGeo.gpsTimeout")
            : t("create.terrainGeo.gpsUnavailable"));
        setCapturing(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  };

  const saveManualPoint = () => {
    const point = { latitude: Number(latitude), longitude: Number(longitude) };
    if (!latitude.trim() || !longitude.trim() || !isValidGeoPoint(point)) {
      setError(t("create.terrainGeo.invalidCoordinates"));
      return;
    }
    setError("");
    onChange({
      ...value,
      point: { ...point, source: "manual", accuracyMeters: null, capturedAt: new Date().toISOString() },
    });
  };

  const calculate = () => {
    const points = parsedPoints.filter((point): point is GeoPoint => point !== null);
    if (points.length !== parsedPoints.length || points.some((point) => !isValidGeoPoint(point))) {
      setMeasurementError(t("create.terrainGeo.invalidContour"));
      return;
    }
    try {
      const measurements = calculateTerrainMeasurements(points);
      setMeasurementError("");
      onChange({ ...value, boundaryPoints: points, measurements });
    } catch (calculationError) {
      setMeasurementError(calculationError instanceof Error ? calculationError.message : t("create.terrainGeo.measurementFailed"));
    }
  };

  return (
    <section className="rounded-3xl border border-border/60 bg-card/85 p-4 shadow-[var(--shadow-soft)] space-y-4">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-2xl bg-accent text-primary flex items-center justify-center shrink-0">
          <MapPin className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{t("create.terrainGeo.title")}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t("create.terrainGeo.description")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>{t("create.terrainGeo.referencePoint")}</Label>
          <Button type="button" variant="outline" size="sm" onClick={captureLocation} disabled={capturing || disabled} className="rounded-xl">
            {capturing ? <Loader2 className="size-4 mr-2 animate-spin" /> : <LocateFixed className="size-4 mr-2" />}
            {t("create.terrainGeo.useGps")}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="terrain-latitude" className="text-xs">{t("create.terrainGeo.latitude")}</Label><Input id="terrain-latitude" inputMode="decimal" value={latitude} readOnly={disabled} onChange={(event) => setLatitude(event.target.value)} placeholder="4.0511" /></div>
          <div><Label htmlFor="terrain-longitude" className="text-xs">{t("create.terrainGeo.longitude")}</Label><Input id="terrain-longitude" inputMode="decimal" value={longitude} readOnly={disabled} onChange={(event) => setLongitude(event.target.value)} placeholder="9.7679" /></div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={saveManualPoint} disabled={disabled} className="w-full">{t("create.terrainGeo.saveCoordinates")}</Button>
        {value.point && <p className="text-xs text-muted-foreground">{t("create.terrainGeo.pointSource")}: {value.point.source === "device_gps" ? t("create.terrainGeo.gpsSource") : t("create.terrainGeo.manualSource")}{value.point.accuracyMeters != null ? ` · ±${Math.round(value.point.accuracyMeters)} m` : ""}</p>}
        {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      </div>

      <div className="border-t border-border/70 pt-4 space-y-2">
        <Label htmlFor="terrain-declared-area">{t("create.terrainGeo.declaredArea")}</Label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input id="terrain-declared-area" inputMode="decimal" value={declaredAreaValue} readOnly={disabled} onChange={(event) => setDeclaredAreaValue(event.target.value)} placeholder="Ex. 500" />
          <select aria-label={t("create.terrainGeo.areaUnit")} value={declaredAreaUnit} disabled={disabled} onChange={(event) => setDeclaredAreaUnit(event.target.value as "m2" | "are" | "ha")} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="m2">m²</option><option value="are">are</option><option value="ha">ha</option>
          </select>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={disabled || !declaredAreaValue.trim() || !Number.isFinite(Number(declaredAreaValue)) || Number(declaredAreaValue) < 0} onClick={() => onChange({ ...value, declaredArea: { value: Number(declaredAreaValue), unit: declaredAreaUnit } })} className="w-full">{t("create.terrainGeo.saveDeclaredArea")}</Button>
        {value.declaredArea && <p className="text-xs text-muted-foreground">{t("create.terrainGeo.declaredAreaSaved")}: {value.declaredArea.value.toLocaleString()} {value.declaredArea.unit === "m2" ? "m²" : value.declaredArea.unit}</p>}
        {value.declaredArea && value.measurements && (() => {
          const declaredSquareMeters = value.declaredArea.value * (value.declaredArea.unit === "ha" ? 10000 : value.declaredArea.unit === "are" ? 100 : 1);
          const difference = Math.abs(declaredSquareMeters - value.measurements.areaSquareMeters);
          const relativeDifference = declaredSquareMeters > 0 ? (difference / declaredSquareMeters) * 100 : null;
          return <p className="text-xs text-muted-foreground">{t("create.terrainGeo.areaDifference")}: {difference.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²{relativeDifference !== null ? ` ( ${relativeDifference.toLocaleString(undefined, { maximumFractionDigits: 1 })}% )` : ""}. {t("create.terrainGeo.areaDifferenceNote")}</p>;
        })()}
      </div>

      <div className="border-t border-border/70 pt-4 space-y-2">
        <Label htmlFor="terrain-contour">{t("create.terrainGeo.boundaryTitle")}</Label>
        <p className="text-xs text-muted-foreground">{t("create.terrainGeo.boundaryHint")}</p>
        <Textarea id="terrain-contour" value={contourText} readOnly={disabled} onChange={(event) => setContourText(event.target.value)} rows={4} placeholder={"4.0511, 9.7679\n4.0512, 9.7680\n4.0510, 9.7682"} />
        <p className="text-xs font-medium">{t("create.terrainGeo.mapSectionTitle")}</p>
        <TerrainBoundaryMap boundaryPoints={value.boundaryPoints} referencePoint={value.point} disabled={disabled} onBoundaryChange={(boundaryPoints) => onChange({ ...value, boundaryPoints, measurements: undefined })} />
        <Button type="button" variant="outline" onClick={calculate} disabled={disabled} className="w-full rounded-xl">
          <Calculator className="size-4 mr-2" />{t("create.terrainGeo.calculate")}
        </Button>
        {measurementError && <p className="text-xs text-destructive" role="alert">{measurementError}</p>}
        {value.measurements && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/60 p-3">
            <div><p className="text-xs text-muted-foreground">{t("create.terrainGeo.perimeter")}</p><p className="text-sm font-semibold">{value.measurements.perimeterMeters.toLocaleString(undefined, { maximumFractionDigits: 1 })} m</p></div>
            <div><p className="text-xs text-muted-foreground">{t("create.terrainGeo.area")}</p><p className="text-sm font-semibold">{value.measurements.areaSquareMeters.toLocaleString(undefined, { maximumFractionDigits: 1 })} m²</p><p className="text-xs text-muted-foreground">{value.measurements.areaHectares.toLocaleString(undefined, { maximumFractionDigits: 4 })} ha</p></div>
            <div className="col-span-2 space-y-1"><p className="text-xs font-medium text-muted-foreground">{t("create.terrainGeo.segmentDistances")}</p>{value.measurements.segmentDistancesMeters.map((distance, index) => <p key={index} className="text-xs text-muted-foreground">{t("create.terrainGeo.side")} {index + 1}: {distance.toLocaleString(undefined, { maximumFractionDigits: 1 })} m</p>)}</div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">{t("create.terrainGeo.estimateDisclaimer")}</p>
      </div>
    </section>
  );
}

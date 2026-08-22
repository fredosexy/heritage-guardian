import { BookOpen, MapPin, Scale, ScrollText, Users, type LucideIcon } from "lucide-react";

export interface DossierTypeMeta {
  id: string;
  icon: LucideIcon;
  descKey: string;
  available: boolean;
}

export const DOSSIER_TYPES: DossierTypeMeta[] = [
  { id: "terrain", icon: MapPin, descKey: "create.terrainDesc", available: true },
  { id: "heritage", icon: Users, descKey: "create.heritageDesc", available: false },
  { id: "volonte", icon: ScrollText, descKey: "create.volonteDesc", available: false },
  { id: "conflit", icon: Scale, descKey: "create.conflitDesc", available: false },
  { id: "savoir", icon: BookOpen, descKey: "create.savoirDesc", available: false },
];

export function iconForType(type: string): LucideIcon {
  return DOSSIER_TYPES.find((t) => t.id === type)?.icon ?? MapPin;
}

export function typeLabelKey(type: string): string {
  return `dossiers.type${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

import { Landmark, ScrollText, Scale, Users, type LucideIcon } from "lucide-react";

export interface PublicDomain {
  id: "patrimoine" | "succession" | "volontes" | "conflits";
  icon: LucideIcon;
  previewModuleId: "terrain" | "heritage" | "volonte" | "conflit";
  titleKey: string;
  descriptionKey: string;
  availabilityKey: string;
}

/** Public V1 business domains, deliberately separate from technical dossier types. */
export const PUBLIC_DOMAINS_V1: PublicDomain[] = [
  { id: "patrimoine", icon: Landmark, previewModuleId: "terrain", titleKey: "home.domains.patrimoine.title", descriptionKey: "home.domains.patrimoine.description", availabilityKey: "home.domains.patrimoine.availability" },
  { id: "succession", icon: Users, previewModuleId: "heritage", titleKey: "home.domains.succession.title", descriptionKey: "home.domains.succession.description", availabilityKey: "home.domains.succession.availability" },
  { id: "volontes", icon: ScrollText, previewModuleId: "volonte", titleKey: "home.domains.volontes.title", descriptionKey: "home.domains.volontes.description", availabilityKey: "home.domains.volontes.availability" },
  { id: "conflits", icon: Scale, previewModuleId: "conflit", titleKey: "home.domains.conflits.title", descriptionKey: "home.domains.conflits.description", availabilityKey: "home.domains.conflits.availability" },
];

export const PUBLIC_ASSET_CATEGORIES = [
  { id: "land", titleKey: "home.assetCategories.land.title", descriptionKey: "home.assetCategories.land.description" },
  { id: "buildings", titleKey: "home.assetCategories.buildings.title", descriptionKey: "home.assetCategories.buildings.description" },
  { id: "rural", titleKey: "home.assetCategories.rural.title", descriptionKey: "home.assetCategories.rural.description" },
  { id: "movable", titleKey: "home.assetCategories.movable.title", descriptionKey: "home.assetCategories.movable.description" },
  { id: "financial", titleKey: "home.assetCategories.financial.title", descriptionKey: "home.assetCategories.financial.description" },
  { id: "other", titleKey: "home.assetCategories.other.title", descriptionKey: "home.assetCategories.other.description" },
] as const;

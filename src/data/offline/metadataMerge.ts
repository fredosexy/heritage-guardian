type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function identityForArrayItem(collection: string, item: unknown, index: number): string {
  if (isRecord(item)) {
    if (typeof item.id === "string" && item.id) return collection + ":id:" + item.id;
    if (collection === "relatedAssets" && typeof item.dossierId === "string") {
      return "relatedAssets:dossier:" + item.dossierId;
    }
    if (collection === "declaredPeople" && typeof item.name === "string") {
      return "declaredPeople:person:" + item.name + ":" + String(item.role ?? "");
    }
    if (collection === "events") {
      return "events:event:" + String(item.date ?? "") + ":" + String(item.type ?? "") + ":" + String(item.description ?? "");
    }
  }
  return collection + ":index:" + index;
}

function mergeHistoricalArray(collection: string, current: unknown, incoming: unknown): unknown[] {
  const previous = Array.isArray(current) ? current : [];
  const changes = Array.isArray(incoming) ? incoming : [];
  const merged = new Map<string, unknown>();
  previous.forEach((item, index) => merged.set(identityForArrayItem(collection, item, index), item));
  changes.forEach((item, index) => merged.set(identityForArrayItem(collection, item, index), item));
  return [...merged.values()];
}

/** Merge a partial agricultural metadata update without erasing unrelated fields or history. */
export function mergeAgriculturalRural(current: unknown, incoming: unknown): JsonRecord {
  const previous = isRecord(current) ? current : {};
  const patch = isRecord(incoming) ? incoming : {};
  const merged: JsonRecord = { ...previous, ...patch };

  if (isRecord(patch.familyDetails)) {
    const details: JsonRecord = isRecord(previous.familyDetails) ? { ...previous.familyDetails } : {};
    for (const [key, value] of Object.entries(patch.familyDetails)) {
      if (value === null) delete details[key];
      else details[key] = value;
    }
    merged.familyDetails = details;
  }

  for (const key of ["declaredPeople", "events", "relatedAssets"]) {
    if (Array.isArray(patch[key])) merged[key] = mergeHistoricalArray(key, previous[key], patch[key]);
  }

  return merged;
}

/** Merge dossier metadata while preserving Terrain sections and agricultural subdocuments. */
export function mergeDossierMetadata(current: unknown, incoming: unknown): JsonRecord {
  const previous = isRecord(current) ? current : {};
  const patch = isRecord(incoming) ? incoming : {};
  const merged: JsonRecord = { ...previous, ...patch };

  if (isRecord(patch.terrain)) {
    const previousTerrain = isRecord(previous.terrain) ? previous.terrain : {};
    const nextTerrain = patch.terrain;
    const previousSections = isRecord(previousTerrain.sections) ? previousTerrain.sections : {};
    const nextSections = isRecord(nextTerrain.sections) ? nextTerrain.sections : {};
    merged.terrain = {
      ...previousTerrain,
      ...nextTerrain,
      ...(isRecord(nextTerrain.sections) ? { sections: { ...previousSections, ...nextSections } } : {}),
    };
  }

  if (isRecord(patch.agriculturalRural)) {
    merged.agriculturalRural = mergeAgriculturalRural(previous.agriculturalRural, patch.agriculturalRural);
  }

  return merged;
}

/** Build a minimal field-level patch from the cached dossier snapshot and edited form. */
export function createAgriculturalRuralPatch(current: unknown, next: JsonRecord): JsonRecord {
  const previous = isRecord(current) ? current : {};
  const patch: JsonRecord = {};

  for (const [key, value] of Object.entries(next)) {
    if (key === "familyDetails" && isRecord(value)) {
      const oldDetails = isRecord(previous.familyDetails) ? previous.familyDetails : {};
      const detailPatch: JsonRecord = {};
      const keys = new Set([...Object.keys(oldDetails), ...Object.keys(value)]);
      for (const detailKey of keys) {
        if (!(detailKey in value)) detailPatch[detailKey] = null;
        else if (JSON.stringify(oldDetails[detailKey]) !== JSON.stringify(value[detailKey])) detailPatch[detailKey] = value[detailKey];
      }
      if (Object.keys(detailPatch).length > 0) patch.familyDetails = detailPatch;
      continue;
    }

    if (["declaredPeople", "events", "relatedAssets"].includes(key) && Array.isArray(value)) {
      const oldItems = Array.isArray(previous[key]) ? previous[key] as unknown[] : [];
      const oldByKey = new Map(oldItems.map((item, index) => [identityForArrayItem(key, item, index), item]));
      const changed = value.filter((item, index) =>
        JSON.stringify(oldByKey.get(identityForArrayItem(key, item, index))) !== JSON.stringify(item),
      );
      if (changed.length > 0) patch[key] = changed;
      continue;
    }

    if (JSON.stringify(previous[key]) !== JSON.stringify(value)) patch[key] = value;
  }

  return patch;
}

export interface AgriculturalAssetRelation {
  id?: string;
  dossierId: string;
  relationType: string;
  active?: boolean;
  createdAt?: string;
  endedAt?: string;
}

export function getActiveAgriculturalRelation(
  relations: AgriculturalAssetRelation[],
  dossierId: string,
): AgriculturalAssetRelation | undefined {
  return relations.find((relation) => relation.dossierId === dossierId && relation.active !== false);
}

export function activateAgriculturalRelation(
  relations: AgriculturalAssetRelation[],
  dossierId: string,
  relationType: string,
  id: string,
  createdAt: string,
): AgriculturalAssetRelation[] {
  if (getActiveAgriculturalRelation(relations, dossierId)) return relations;
  return [...relations, { id, dossierId, relationType, active: true, createdAt }];
}

export function endAgriculturalRelation(
  relations: AgriculturalAssetRelation[],
  dossierId: string,
  endedAt: string,
): AgriculturalAssetRelation[] {
  return relations.map((relation) =>
    relation.dossierId === dossierId && relation.active !== false
      ? { ...relation, active: false, endedAt }
      : relation,
  );
}

export function updateActiveAgriculturalRelationType(
  relations: AgriculturalAssetRelation[],
  dossierId: string,
  relationType: string,
): AgriculturalAssetRelation[] {
  return relations.map((relation) =>
    relation.dossierId === dossierId && relation.active !== false
      ? { ...relation, relationType }
      : relation,
  );
}

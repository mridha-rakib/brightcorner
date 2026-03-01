export type AuditFields = {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
};

export function createAuditFields(actorId?: string): AuditFields {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
    ...(actorId ? { createdBy: actorId, updatedBy: actorId } : {}),
  };
}

export function touchAuditFields(current: AuditFields, actorId?: string): AuditFields {
  return {
    ...current,
    updatedAt: new Date(),
    ...(actorId ? { updatedBy: actorId } : {}),
  };
}

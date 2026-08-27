import {
  KNOWLEDGE_RECORD_FAMILIES,
  type KnowledgeRecordFamily,
} from "./knowledgeStore.js";

export interface KnowledgeContentReference {
  family: "content";
  id: string;
  codec: string;
}

export interface KnowledgeLogicalRecord {
  family: KnowledgeRecordFamily;
  id: string;
  [key: string]: unknown;
}

export function isKnowledgeRecordFamily(
  value: string,
): value is KnowledgeRecordFamily {
  return (KNOWLEDGE_RECORD_FAMILIES as readonly string[]).includes(value);
}

export function getKnowledgeRecordFamilyNames(): KnowledgeRecordFamily[] {
  return [...KNOWLEDGE_RECORD_FAMILIES];
}

export function resolveKnowledgeRecordContentReferences(
  record: unknown,
): KnowledgeContentReference[] {
  const references = new Map<string, KnowledgeContentReference>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry);
      return;
    }
    if (!value || typeof value !== "object") return;
    const candidate = value as Record<string, unknown>;
    if (
      candidate.family === "content" &&
      typeof candidate.id === "string" &&
      typeof candidate.codec === "string"
    ) {
      references.set(`${candidate.id}\0${candidate.codec}`, {
        family: "content",
        id: candidate.id,
        codec: candidate.codec,
      });
    }
    for (const child of Object.values(candidate)) visit(child);
  };
  visit(record);
  return [...references.values()].sort(
    (left, right) =>
      left.id.localeCompare(right.id) || left.codec.localeCompare(right.codec),
  );
}

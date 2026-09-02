import type { Asset as PrismaAsset } from "@prisma/client";
import type { Asset } from "./types";

/** Convert a Prisma Asset record into the API-facing Asset shape. */
export function serializeAsset(row: PrismaAsset): Asset {
  let references: string[] = [];
  try {
    const parsed = JSON.parse(row.referenceWebsites || "[]");
    if (Array.isArray(parsed)) {
      references = parsed.filter((x) => typeof x === "string");
    }
  } catch {
    references = [];
  }

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    fileName: row.fileName,
    fileSizeBytes: row.fileSizeBytes,
    fileExtension: row.fileExtension,
    storageUrl: row.storageUrl,
    thumbnailUrl: row.thumbnailUrl,
    title: row.title,
    category: row.category,
    description: row.description,
    promptUsed: row.promptUsed,
    referenceWebsites: references,
    workflowNotes: row.workflowNotes,
    authorName: row.authorName,
  };
}

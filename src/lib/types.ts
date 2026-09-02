// Shared types for the Asset Hub

export type FileCategory = "image" | "3d-previewable" | "3d-binary";

export interface Asset {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  fileSizeBytes: number;
  fileExtension: string;
  storageUrl: string;
  thumbnailUrl: string | null;
  title: string;
  category: string;
  description: string | null;
  promptUsed: string | null;
  referenceWebsites: string[];
  workflowNotes: string | null;
  authorName: string;
}

export interface AssetInput {
  fileName: string;
  fileSizeBytes: number;
  fileExtension: string;
  storageUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  category: string;
  description?: string;
  promptUsed?: string;
  referenceWebsites?: string[];
  workflowNotes?: string;
  authorName?: string;
}

export const IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "svg",
  "tiff",
  "tif",
  "hdr",
  "exr",
];

export const PREVIEWABLE_3D_EXTENSIONS = ["obj", "stl", "gltf", "glb"];

export const BINARY_3D_EXTENSIONS = ["fbx", "usd", "usdz", "abc"];

export const ALL_3D_EXTENSIONS = [
  ...PREVIEWABLE_3D_EXTENSIONS,
  ...BINARY_3D_EXTENSIONS,
];

export const ACCEPTED_EXTENSIONS = [
  ...IMAGE_EXTENSIONS,
  ...ALL_3D_EXTENSIONS,
];

export function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts.pop()!.toLowerCase();
}

export function getFileCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase().replace(/^\./, "");
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (PREVIEWABLE_3D_EXTENSIONS.includes(ext)) return "3d-previewable";
  if (BINARY_3D_EXTENSIONS.includes(ext)) return "3d-binary";
  return "3d-binary";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(d);
}

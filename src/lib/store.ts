"use client";

import { create } from "zustand";
import type { Asset } from "@/lib/types";

export type ViewMode = "grid" | "table";
export type FileTypeFilter =
  | "all"
  | "images"
  | "3d-previewable"
  | "3d-binary";

interface AssetState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  searchQuery: string;
  fileTypeFilter: FileTypeFilter;
  categoryFilter: string;
  selectedAsset: Asset | null;
  uploadOpen: boolean;
  detailOpen: boolean;

  setViewMode: (v: ViewMode) => void;
  setSearchQuery: (q: string) => void;
  setFileTypeFilter: (f: FileTypeFilter) => void;
  setCategoryFilter: (c: string) => void;
  openUpload: () => void;
  closeUpload: () => void;
  openDetail: (a: Asset) => void;
  closeDetail: () => void;
  fetchAssets: () => Promise<void>;
  addAsset: (a: Asset) => void;
  removeAsset: (id: string) => Promise<void>;
}

function fileTypeExtensions(filter: FileTypeFilter): string | "all" {
  switch (filter) {
    case "images":
      return "png,jpg,jpeg,webp,svg,tiff,tif,hdr,exr";
    case "3d-previewable":
      return "obj,stl,gltf,glb";
    case "3d-binary":
      return "fbx,usd,usdz,abc";
    default:
      return "all";
  }
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  loading: true,
  error: null,
  viewMode: "grid",
  searchQuery: "",
  fileTypeFilter: "all",
  categoryFilter: "all",
  selectedAsset: null,
  uploadOpen: false,
  detailOpen: false,

  setViewMode: (v) => set({ viewMode: v }),
  setSearchQuery: (q) => {
    set({ searchQuery: q });
    get().fetchAssets();
  },
  setFileTypeFilter: (f) => {
    set({ fileTypeFilter: f });
    get().fetchAssets();
  },
  setCategoryFilter: (c) => {
    set({ categoryFilter: c });
    get().fetchAssets();
  },
  openUpload: () => set({ uploadOpen: true }),
  closeUpload: () => set({ uploadOpen: false }),
  openDetail: (a) => set({ selectedAsset: a, detailOpen: true }),
  closeDetail: () => set({ detailOpen: false, selectedAsset: null }),

  fetchAssets: async () => {
    const { searchQuery, fileTypeFilter, categoryFilter } = get();
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      params.set("type", fileTypeExtensions(fileTypeFilter));
      params.set("category", categoryFilter);
      const res = await fetch(`/api/assets?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch assets");
      const data = await res.json();
      set({ assets: data.assets as Asset[], loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  },

  addAsset: (a) => set((s) => ({ assets: [a, ...s.assets] })),

  removeAsset: async (id) => {
    try {
      await fetch(`/api/assets/${id}`, { method: "DELETE" });
      set((s) => ({
        assets: s.assets.filter((a) => a.id !== id),
        selectedAsset:
          s.selectedAsset?.id === id ? null : s.selectedAsset,
        detailOpen: s.selectedAsset?.id === id ? false : s.detailOpen,
      }));
    } catch (e) {
      console.error("removeAsset error:", e);
    }
  },
}));

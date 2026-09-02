"use client";

import { Search, Upload, LayoutGrid, Table2, Boxes } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssetStore, type ViewMode, type FileTypeFilter } from "@/lib/store";

const CATEGORIES = [
  "all",
  "Character",
  "Creature",
  "Environment",
  "Abstract",
  "3D Prop",
  "Rigged Character",
  "Scene",
  "Simulation",
  "Uncategorized",
];

export function Header() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    fileTypeFilter,
    setFileTypeFilter,
    categoryFilter,
    setCategoryFilter,
    openUpload,
    assets,
  } = useAssetStore();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 md:px-6">
        {/* Top row: brand + search + upload */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-1 ring-1 ring-purple-500/40 shadow-sm shadow-purple-500/20">
              <img src="/logo.png" alt="Photo Dashboard Logo" className="size-full object-contain" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold tracking-tight">
                Asset Forge
              </h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                {assets.length} assets catalogued
              </p>
            </div>
          </div>


          <div className="relative order-3 w-full min-w-0 flex-1 sm:order-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, prompt, file name, author…"
              className="h-9 rounded-lg border-border/60 bg-card/60 pl-9 placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border/60 bg-card/60 p-0.5">
              <ViewToggleBtn
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                label="Grid"
              >
                <LayoutGrid className="size-4" />
              </ViewToggleBtn>
              <ViewToggleBtn
                active={viewMode === "table"}
                onClick={() => setViewMode("table")}
                label="Table"
              >
                <Table2 className="size-4" />
              </ViewToggleBtn>
            </div>

            <Button
              onClick={openUpload}
              className="h-9 gap-1.5 rounded-lg shadow-sm shadow-primary/20"
            >
              <Upload className="size-4" />
              <span className="hidden sm:inline">Upload Asset</span>
              <span className="sm:hidden">Upload</span>
            </Button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="All Files"
            active={fileTypeFilter === "all"}
            onClick={() => setFileTypeFilter("all")}
          />
          <FilterChip
            label="Images"
            active={fileTypeFilter === "images"}
            onClick={() => setFileTypeFilter("images")}
          />
          <FilterChip
            label="3D Previewable"
            active={fileTypeFilter === "3d-previewable"}
            onClick={() => setFileTypeFilter("3d-previewable")}
          />
          <FilterChip
            label="Binary 3D"
            active={fileTypeFilter === "3d-binary"}
            onClick={() => setFileTypeFilter("3d-binary")}
          />

          <div className="ml-auto flex items-center gap-2">
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v)}
            >
              <SelectTrigger className="h-8 w-[170px] rounded-lg border-border/60 bg-card/60 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c === "all" ? "All categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}

function ViewToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors ${
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

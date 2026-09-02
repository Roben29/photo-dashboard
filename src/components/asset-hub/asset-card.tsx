"use client";

import { memo } from "react";
import Image from "next/image";
import {
  Box,
  FileBox,
  ImageIcon,
  Clock,
  User,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getFileCategory, formatFileSize, formatRelativeTime, type FileCategory } from "@/lib/types";
import type { Asset } from "@/lib/types";
import { useAssetStore } from "@/lib/store";

const CATEGORY_ICONS: Record<FileCategory, LucideIcon> = {
  image: ImageIcon,
  "3d-previewable": Box,
  "3d-binary": FileBox,
};

function badgeColor(ext: string): string {
  const cat = getFileCategory(ext);
  if (cat === "image")
    return "border-amber-500/30 bg-amber-500/15 text-amber-300";
  if (cat === "3d-previewable")
    return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
  return "border-rose-500/30 bg-rose-500/15 text-rose-300";
}

export const AssetCard = memo(function AssetCard({ asset }: { asset: Asset }) {
  const openDetail = useAssetStore((s) => s.openDetail);
  const Icon = CATEGORY_ICONS[getFileCategory(asset.fileExtension)];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => openDetail(asset)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail(asset);
        }
      }}
      className="group relative cursor-pointer overflow-hidden border-border/60 bg-card/60 p-0 transition-all hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
        {asset.thumbnailUrl ? (
          <Image
            src={asset.thumbnailUrl}
            alt={asset.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/60 to-muted/20">
            <Icon className="size-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge
            variant="outline"
            className={`rounded-md text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md ${badgeColor(
              asset.fileExtension,
            )}`}
          >
            .{asset.fileExtension}
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold leading-snug">
            {asset.title}
          </h3>
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {asset.fileName}
        </p>
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-primary/70" />
            {asset.category}
          </span>
          <span>{formatFileSize(asset.fileSizeBytes)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {asset.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatRelativeTime(asset.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
});

"use client";

import { Box, FileBox, ImageIcon, type LucideIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getFileCategory, formatFileSize, formatRelativeTime } from "@/lib/types";
import type { Asset } from "@/lib/types";
import { useAssetStore } from "@/lib/store";

function iconFor(ext: string): LucideIcon {
  const cat = getFileCategory(ext);
  if (cat === "image") return ImageIcon;
  if (cat === "3d-previewable") return Box;
  return FileBox;
}

export function AssetTable({ assets }: { assets: Asset[] }) {
  const openDetail = useAssetStore((s) => s.openDetail);

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
      <div className="thin-scroll max-h-[calc(100vh-260px)] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="w-[44%] pl-4">Asset</TableHead>
              <TableHead className="w-[12%]">Format</TableHead>
              <TableHead className="w-[14%]">Category</TableHead>
              <TableHead className="w-[12%]">Size</TableHead>
              <TableHead className="w-[10%]">Author</TableHead>
              <TableHead className="w-[8%] pr-4 text-right">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((a) => {
              const Icon = iconFor(a.fileExtension);
              return (
                <TableRow
                  key={a.id}
                  onClick={() => openDetail(a)}
                  className="cursor-pointer border-border/40 transition-colors hover:bg-primary/5"
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/40">
                        {a.thumbnailUrl ? (
                          <img
                            src={a.thumbnailUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <Icon className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {a.title}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {a.fileName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded text-[10px] font-semibold uppercase"
                    >
                      .{a.fileExtension}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.category}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(a.fileSizeBytes)}
                  </TableCell>
                  <TableCell className="truncate text-sm text-muted-foreground">
                    {a.authorName}
                  </TableCell>
                  <TableCell className="pr-4 text-right text-xs text-muted-foreground">
                    {formatRelativeTime(a.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

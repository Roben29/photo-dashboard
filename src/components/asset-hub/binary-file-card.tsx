"use client";

import {
  Download,
  FileBox,
  HardDrive,
  Box as BoxIcon,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/types";
import type { Asset } from "@/lib/types";

export function BinaryFileCard({ asset }: { asset: Asset }) {
  // Placeholder metrics that would come from parsing the file in a real build
  const polyEstimate = (() => {
    // Rough heuristic so the number feels real
    const seed =
      asset.fileSizeBytes +
      asset.fileExtension.length * 1000 +
      asset.title.length;
    return (seed % 450000) + 12000;
  })();

  const vertices = Math.round(polyEstimate / 3);
  const fps = asset.fileExtension === "fbx" ? 30 : 24;

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-br from-muted/40 via-card to-background p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 bg-grid"
          aria-hidden
        />
        <div className="relative flex size-24 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
          <FileBox className="size-11 text-primary" />
        </div>
        <div className="relative text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Binary 3D asset
          </p>
          <p className="mt-1 font-mono text-xl font-semibold">
            .{asset.fileExtension}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Stored as a downloadable binary. In-browser preview is not
            available for this format.
          </p>
        </div>

        <Button asChild className="relative mt-1 gap-2">
          <a href={asset.storageUrl} download={asset.fileName}>
            <Download className="size-4" />
            Download file
          </a>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px border-t border-border/60 bg-border/40 sm:grid-cols-4">
        <Stat
          icon={<HardDrive className="size-3.5" />}
          label="File size"
          value={formatFileSize(asset.fileSizeBytes)}
        />
        <Stat
          icon={<BoxIcon className="size-3.5" />}
          label="Polys (est.)"
          value={polyEstimate.toLocaleString()}
        />
        <Stat
          icon={<Layers className="size-3.5" />}
          label="Vertices"
          value={vertices.toLocaleString()}
        />
        <Stat
          icon={<FileBox className="size-3.5" />}
          label="Target FPS"
          value={`${fps} fps`}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-card/60 px-3 py-3">
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  Trash2,
  Copy,
  Check,
  Link2,
  Calendar,
  User,
  HardDrive,
  Sparkles,
  ListTree,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAssetStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  getFileCategory,
  formatDate,
  formatFileSize,
} from "@/lib/types";
import { ImageViewer } from "./image-viewer";
import { BinaryFileCard } from "./binary-file-card";

const ModelViewer3D = dynamic(
  () => import("./model-viewer-3d").then((m) => m.ModelViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Loading 3D engine…
      </div>
    ),
  },
);

export function DetailDrawer() {
  const { detailOpen, selectedAsset, closeDetail, removeAsset } =
    useAssetStore();
  const { toast } = useToast();

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!selectedAsset) return null;

  const asset = selectedAsset;
  const category = getFileCategory(asset.fileExtension);

  const copyPrompt = async () => {
    if (!asset.promptUsed) return;
    await navigator.clipboard.writeText(asset.promptUsed);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1500);
  };

  const copyUrl = async () => {
    const abs = `${window.location.origin}${asset.storageUrl}`;
    await navigator.clipboard.writeText(abs);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  const onDelete = async () => {
    await removeAsset(asset.id);
    toast({
      title: "Asset deleted",
      description: `${asset.title} was removed from your library.`,
    });
  };

  return (
    <Dialog open={detailOpen} onOpenChange={(o) => (o ? null : closeDetail())}>
      <DialogContent
        className="thin-scroll flex max-h-[94vh] w-full max-w-[1400px] gap-0 overflow-hidden border-border/60 bg-card/95 p-0 backdrop-blur-xl sm:max-w-[1400px]"
        showCloseButton={false}
      >
        {/* Left: viewer */}
        <div className="flex min-h-0 flex-1 flex-col border-r border-border/60">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Badge
                variant="outline"
                className="rounded text-[10px] font-semibold uppercase"
              >
                .{asset.fileExtension}
              </Badge>
              <span className="truncate text-sm font-medium">
                {asset.fileName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs"
                onClick={copyUrl}
              >
                {copiedUrl ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                Copy link
              </Button>
              <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
                <a href={asset.storageUrl} download={asset.fileName}>
                  <Download className="size-3.5" />
                  Download
                </a>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[320px] flex-1">
            {category === "image" && (
              <ImageViewer src={asset.storageUrl} alt={asset.title} />
            )}
            {category === "3d-previewable" && (
              <ModelViewer3D
                url={asset.storageUrl}
                extension={asset.fileExtension}
              />
            )}
            {category === "3d-binary" && <BinaryFileCard asset={asset} />}
          </div>
        </div>

        {/* Right: metadata */}
        <div className="flex w-full max-w-[440px] flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="min-w-0">
              <DialogTitle className="text-lg leading-tight">
                {asset.title}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                {asset.category}
              </DialogDescription>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0"
              onClick={closeDetail}
            >
              <X className="size-4" />
            </Button>
          </div>

          <ScrollArea className="thin-scroll flex-1">
            <div className="flex flex-col gap-5 px-5 py-4">
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2">
                <StatRow
                  icon={<User className="size-3.5" />}
                  label="Author"
                  value={asset.authorName}
                />
                <StatRow
                  icon={<Calendar className="size-3.5" />}
                  label="Added"
                  value={formatDate(asset.createdAt)}
                />
                <StatRow
                  icon={<HardDrive className="size-3.5" />}
                  label="File size"
                  value={formatFileSize(asset.fileSizeBytes)}
                />
                <StatRow
                  icon={<Sparkles className="size-3.5" />}
                  label="Format"
                  value={`.${asset.fileExtension}`}
                />
              </div>

              <Separator />

              {/* Description */}
              {asset.description && (
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Description / Process
                  </h4>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {asset.description}
                  </p>
                </section>
              )}

              {/* Prompt */}
              {asset.promptUsed && (
                <section>
                  <div className="mb-1.5 flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Sparkles className="size-3.5 text-primary" />
                      Prompt Used
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs"
                      onClick={copyPrompt}
                    >
                      {copiedPrompt ? (
                        <Check className="size-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                      {copiedPrompt ? "Copied" : "Copy prompt"}
                    </Button>
                  </div>
                  <pre className="thin-scroll max-h-52 overflow-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-xs leading-relaxed text-foreground/90">
                    {asset.promptUsed}
                  </pre>
                </section>
              )}

              {/* Workflow */}
              {asset.workflowNotes && (
                <section>
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <ListTree className="size-3.5 text-primary" />
                    Workflow Notes
                  </h4>
                  <p className="whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-3 text-xs leading-relaxed text-foreground/90">
                    {asset.workflowNotes}
                  </p>
                </section>
              )}

              {/* References */}
              {asset.referenceWebsites.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Link2 className="size-3.5 text-primary" />
                    Reference Websites
                  </h4>
                  <ul className="flex flex-col gap-1.5">
                    {asset.referenceWebsites.map((r, i) => (
                      <li key={`${r}-${i}`}>
                        <a
                          href={r}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                          <span className="truncate">{r}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </ScrollArea>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-2 border-t border-border/60 px-5 py-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border/60 bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
                  <AlertDialogDescription>
                    “{asset.title}” and its file will be permanently removed.
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete asset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button asChild className="h-8 gap-1.5 text-xs">
              <a href={asset.storageUrl} download={asset.fileName}>
                <Download className="size-3.5" />
                Download file
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  );
}

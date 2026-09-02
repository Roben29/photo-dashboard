"use client";

import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  X,
  Plus,
  Link2,
  Copy,
  Check,
  FileBox,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAssetStore } from "@/lib/store";
import {
  ACCEPTED_EXTENSIONS,
  formatFileSize,
  getExtension,
  getFileCategory,
} from "@/lib/types";

const CATEGORIES = [
  "Character",
  "Creature",
  "Environment",
  "Abstract",
  "3D Prop",
  "Rigged Character",
  "Scene",
  "Simulation",
  "Texture",
  "Uncategorized",
];

export function UploadModal() {
  const { uploadOpen, closeUpload, addAsset, fetchAssets } = useAssetStore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [description, setDescription] = useState("");
  const [promptUsed, setPromptUsed] = useState("");
  const [workflowNotes, setWorkflowNotes] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [references, setReferences] = useState<string[]>([]);
  const [newRef, setNewRef] = useState("");

  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setFile(null);
    setThumbnailPreview(null);
    setTitle("");
    setCategory("Uncategorized");
    setDescription("");
    setPromptUsed("");
    setWorkflowNotes("");
    setAuthorName("");
    setReferences([]);
    setNewRef("");
  }, []);

  const handleClose = () => {
    closeUpload();
    setTimeout(resetForm, 200);
  };

  const acceptFile = useCallback((f: File) => {
    const ext = getExtension(f.name);
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast({
        variant: "destructive",
        title: "Unsupported file type",
        description: `.${ext || "?"} is not supported. Accepted: ${ACCEPTED_EXTENSIONS.join(
          ", ",
        )}`,
      });
      return;
    }
    setFile(f);
    if (getFileCategory(ext) === "image") {
      const url = URL.createObjectURL(f);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
    // Auto-fill title from file name if empty
    setTitle((prev) => prev || f.name.replace(/\.[^.]+$/, ""));
  }, [toast]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) acceptFile(f);
    },
    [acceptFile],
  );

  const addReference = () => {
    const v = newRef.trim();
    if (!v) return;
    let url = v;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    setReferences((r) => [...r, url]);
    setNewRef("");
  };

  const copyPrompt = async () => {
    if (!promptUsed) return;
    try {
      await navigator.clipboard.writeText(promptUsed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const submit = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Select a file to upload" });
      return;
    }
    if (!title.trim()) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("category", category);
      fd.append("description", description);
      fd.append("promptUsed", promptUsed);
      fd.append("workflowNotes", workflowNotes);
      fd.append("authorName", authorName || "Anonymous");
      fd.append("referenceWebsites", JSON.stringify(references));

      const res = await fetch("/api/assets", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      addAsset(data.asset);
      await fetchAssets();
      toast({
        title: "Asset uploaded",
        description: `${data.asset.title} was added to your library.`,
      });
      handleClose();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={uploadOpen} onOpenChange={(o) => (o ? null : handleClose())}>
      <DialogContent className="thin-scroll max-h-[92vh] gap-0 overflow-y-auto border-border/60 bg-card/95 p-0 backdrop-blur-xl sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UploadCloud className="size-5 text-primary" />
            Upload Asset
          </DialogTitle>
          <DialogDescription>
            Drag in a 3D model or image, then capture the full creation
            metadata.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Drop zone */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-border/70 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <UploadCloud className="size-6" />
              </div>
              <div>
                <p className="font-medium">Drop a file here, or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports .obj .stl .gltf .glb .fbx .usd .usdz .abc · png jpg
                  webp svg tiff hdr
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_EXTENSIONS.map((e) => "." + e).join(",")}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) acceptFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-3">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt=""
                  className="size-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileBox className="size-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · .{getExtension(file.name)}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  setThumbnailPreview(null);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {/* Metadata form */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cybernetic Warrior Bust"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="author">Author / Source</Label>
            <Input
              id="author"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name or studio"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desc">Description / Creation Process</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the asset, how it was made, and intended use…"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt" className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Prompt Used
              </Label>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={copyPrompt}
                className="h-7 gap-1.5 text-xs"
                disabled={!promptUsed}
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea
              id="prompt"
              value={promptUsed}
              onChange={(e) => setPromptUsed(e.target.value)}
              rows={3}
              className="font-mono text-xs"
              placeholder="Midjourney / Stable Diffusion / Meshy prompt with parameters…"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workflow">Workflow Notes</Label>
            <Textarea
              id="workflow"
              value={workflowNotes}
              onChange={(e) => setWorkflowNotes(e.target.value)}
              rows={2}
              className="text-xs"
              placeholder="e.g. Modeled in Blender → sculpted in ZBrush → baked in Substance"
            />
          </div>

          {/* References */}
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5">
              <Link2 className="size-3.5 text-primary" />
              Reference Websites / Tools
            </Label>
            <div className="flex gap-2">
              <Input
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addReference();
                  }
                }}
                placeholder="https://reference-url.com"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addReference}
                className="shrink-0"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {references.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {references.map((r, i) => (
                  <Badge
                    key={`${r}-${i}`}
                    variant="secondary"
                    className="gap-1 rounded-md bg-secondary/70 pr-1 font-normal"
                  >
                    <span className="max-w-[180px] truncate">{r}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setReferences((refs) => refs.filter((_, idx) => idx !== i))
                      }
                      className="ml-0.5 rounded-sm p-0.5 hover:bg-background/60"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting || !file}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="size-4" />
                Save Asset
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

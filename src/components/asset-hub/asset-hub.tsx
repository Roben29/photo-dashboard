"use client";

import { useEffect } from "react";
import { Boxes, SearchX, Loader2, FolderOpen } from "lucide-react";
import { useAssetStore } from "@/lib/store";
import { Header } from "./header";
import { AssetGrid } from "./asset-grid";
import { AssetTable } from "./asset-table";
import { UploadModal } from "./upload-modal";
import { DetailDrawer } from "./detail-drawer";

export function AssetHub() {
  const {
    assets,
    loading,
    error,
    viewMode,
    fetchAssets,
    openUpload,
  } = useAssetStore();

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const isEmpty = !loading && assets.length === 0;

  return (
    <div className="bg-grid flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-6">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAssets} />
        ) : isEmpty ? (
          <EmptyState onUpload={openUpload} />
        ) : viewMode === "grid" ? (
          <AssetGrid assets={assets} />
        ) : (
          <AssetTable assets={assets} />
        )}
      </main>

      <Footer />

      <UploadModal />
      <DetailDrawer />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <Loader2 className="size-7 animate-spin text-primary" />
      <p className="text-sm">Loading your asset library…</p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const isSupabasePending = message.toLowerCase().includes("supabase");

  if (isSupabasePending) {
    return (
      <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-primary/30 bg-card/80 p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4 border-b border-border/60 pb-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
            <Boxes className="size-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Supabase PostgreSQL Connection Pending</h3>
            <p className="text-xs text-muted-foreground">Ready for real-time asset management</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <p className="text-muted-foreground">
            The project has been configured for **Supabase PostgreSQL**. To complete setup:
          </p>

          <div className="space-y-3 rounded-xl bg-muted/40 p-4 font-mono text-xs border border-border/50">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] font-sans font-medium">1. Replace <code className="text-amber-400">[YOUR-PASSWORD]</code> in <code className="text-primary">.env</code> with your Supabase DB password:</span>
              <code className="text-emerald-400 break-all bg-background/80 p-2 rounded border border-border/40">
                DATABASE_URL="postgresql://postgres.iwqkhrvioelknvoxwglf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
              </code>
            </div>
            <div className="flex flex-col gap-1 pt-2">
              <span className="text-muted-foreground text-[11px] font-sans font-medium">2. Push schema to Supabase:</span>
              <code className="text-primary bg-background/80 p-2 rounded border border-border/40">
                bun run db:push
              </code>
            </div>
          </div>


          <p className="text-xs text-muted-foreground">
            Once configured, click <strong>Test Connection</strong> below to load your real-time asset dashboard.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-emerald-500"
          >
            Test Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <SearchX className="size-7" />
      </div>
      <div>
        <p className="font-medium">Connection Error</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}


function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="relative">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
          <FolderOpen className="size-10" />
        </div>
        <Boxes className="absolute -right-2 -top-2 size-7 text-primary/60" />
      </div>
      <div className="max-w-md">
        <h3 className="text-lg font-semibold">Your library is empty</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your first 3D model, high-resolution render, or concept art.
          Capture the full creation metadata — prompts, references, and
          workflow — so every asset stays searchable.
        </p>
      </div>
      <button
        onClick={onUpload}
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
      >
        Upload your first asset
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <Boxes className="size-4 text-primary" />
          <span className="font-medium">Asset Forge</span>
          <span className="text-muted-foreground/50">·</span>
          <span>Browser-based creative asset hub</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Three.js · WebGL in-browser preview</span>
          <span className="text-muted-foreground/50">·</span>
          <span>Zero recurring cloud fees</span>
        </div>
      </div>
    </footer>
  );
}



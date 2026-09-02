"use client";

import { AssetCard } from "./asset-card";
import type { Asset } from "@/lib/types";

export function AssetGrid({ assets }: { assets: Asset[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {assets.map((a) => (
        <AssetCard key={a.id} asset={a} />
      ))}
    </div>
  );
}

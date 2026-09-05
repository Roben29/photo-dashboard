import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeAsset } from "@/lib/serialize";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const row = await db.asset.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ asset: serializeAsset(row) });
  } catch (error) {
    console.error("GET /api/assets/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load asset" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const row = await db.asset.findUnique({ where: { id } });
    if (!row) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Attempt to remove the file from Supabase storage or local disk (best-effort)
    try {
      if (row.storageUrl?.includes("/storage/v1/object/public/assets/")) {
        const parts = row.storageUrl.split("/storage/v1/object/public/assets/");
        const fileKey = parts[1];
        if (fileKey) {
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const isValidServiceKey =
            serviceKey &&
            serviceKey !== "your-service-role-key-here" &&
            !serviceKey.includes("service-role-key");
          const supabaseKey = isValidServiceKey
            ? serviceKey
            : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

          if (process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey) {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey);
            await supabase.storage.from("assets").remove([decodeURIComponent(fileKey)]);
          }
        }
      } else if (row.storageUrl?.startsWith("/uploads/")) {
        const filePath = path.join(
          process.cwd(),
          "public",
          row.storageUrl.replace(/^\//, ""),
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fileErr) {
      console.warn("Could not delete file from storage:", fileErr);
    }

    await db.asset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/assets/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 },
    );
  }
}

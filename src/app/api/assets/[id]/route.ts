import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeAsset } from "@/lib/serialize";
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

    // Attempt to remove the file from disk (best-effort)
    try {
      if (row.storageUrl?.startsWith("/uploads/")) {
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
      console.warn("Could not delete file on disk:", fileErr);
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

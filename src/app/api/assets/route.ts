import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeAsset } from "@/lib/serialize";
import { getExtension } from "@/lib/types";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";
    const fileType = searchParams.get("type") || "all";
    const category = searchParams.get("category") || "all";

    const rows = await db.asset.findMany({
      orderBy: { createdAt: "desc" },
    });

    let assets = rows.map(serializeAsset);

    if (query) {
      assets = assets.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.fileName.toLowerCase().includes(query) ||
          (a.description || "").toLowerCase().includes(query) ||
          (a.promptUsed || "").toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query) ||
          a.authorName.toLowerCase().includes(query),
      );
    }

    if (fileType !== "all") {
      const exts = fileType.split(",").map((e) => e.trim().toLowerCase());
      assets = assets.filter((a) => exts.includes(a.fileExtension.toLowerCase()));
    }

    if (category !== "all") {
      assets = assets.filter(
        (a) => a.category.toLowerCase() === category.toLowerCase(),
      );
    }

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("GET /api/assets error:", error);
    return NextResponse.json(
      { error: "Failed to load assets" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null) || "";
    const category = (formData.get("category") as string | null) || "Uncategorized";
    const description = (formData.get("description") as string | null) || "";
    const promptUsed = (formData.get("promptUsed") as string | null) || "";
    const workflowNotes = (formData.get("workflowNotes") as string | null) || "";
    const authorName = (formData.get("authorName") as string | null) || "Anonymous";
    const referencesRaw = (formData.get("referenceWebsites") as string | null) || "[]";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const ext = getExtension(file.name);
    if (!ext) {
      return NextResponse.json(
        { error: "Could not determine file extension" },
        { status: 400 },
      );
    }

    // Save file to public/uploads with a hashed unique name
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12);
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/_+/g, "_");
    const storedName = `${hash}_${safeName}`;
    const fullPath = path.join(uploadsDir, storedName);
    fs.writeFileSync(fullPath, buffer);
    const storageUrl = `/uploads/${storedName}`;

    // Generate a thumbnail for image formats by reusing the stored file
    const imageExts = ["png", "jpg", "jpeg", "webp", "svg", "gif"];
    const thumbnailUrl = imageExts.includes(ext) ? storageUrl : null;

    let references: string[] = [];
    try {
      const parsed = JSON.parse(referencesRaw);
      if (Array.isArray(parsed)) {
        references = parsed.filter((x) => typeof x === "string" && x.trim());
      }
    } catch {
      references = [];
    }

    const row = await db.asset.create({
      data: {
        fileName: file.name,
        fileSizeBytes: buffer.length,
        fileExtension: ext,
        storageUrl,
        thumbnailUrl,
        title: title.trim(),
        category,
        description: description.trim() || null,
        promptUsed: promptUsed.trim() || null,
        referenceWebsites: JSON.stringify(references),
        workflowNotes: workflowNotes.trim() || null,
        authorName: authorName.trim() || "Anonymous",
      },
    });

    return NextResponse.json({ asset: serializeAsset(row) });
  } catch (error) {
    console.error("POST /api/assets error:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 },
    );
  }
}

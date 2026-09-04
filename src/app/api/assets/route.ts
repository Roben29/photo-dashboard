import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeAsset } from "@/lib/serialize";
import { getExtension } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  } catch (error: any) {
    console.error("GET /api/assets error:", error);
    const isPlaceholder = process.env.DATABASE_URL?.includes("[YOUR-PROJECT-REF]");
    const errorMsg = isPlaceholder
      ? "Supabase database setup pending. Please update your DATABASE_URL in .env and execute 'bun run db:push'."
      : "Failed to load assets from database.";
    return NextResponse.json(
      { error: errorMsg, assets: [] },
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

    const arrayBuffer = await file.arrayBuffer();
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("assets")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(fileName);

    const imageExts = ["png", "jpg", "jpeg", "webp", "svg", "gif"];
    const thumbnailUrl = imageExts.includes(ext) ? publicUrl : null;

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
        fileSizeBytes: arrayBuffer.byteLength,
        fileExtension: ext,
        storageUrl: publicUrl,
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

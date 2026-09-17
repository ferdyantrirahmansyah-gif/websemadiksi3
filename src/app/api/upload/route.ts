import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Format file harus berupa gambar (JPG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran gambar maksimal 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isServerless = Boolean(
      process.env.VERCEL || 
      process.env.AWS_LAMBDA_FUNCTION_NAME || 
      process.env.LAMBDA_TASK_ROOT
    );

    let publicUrl = "";

    if (isServerless) {
      // In serverless environments, disk is read-only. Use Base64 data URL.
      const mimeType = file.type || "image/jpeg";
      publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } else {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const rawExt = path.extname(file.name) || ".jpg";
        const ext = rawExt.toLowerCase();
        const filename = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);
        publicUrl = `/uploads/avatars/${filename}`;
      } catch {
        const mimeType = file.type || "image/jpeg";
        publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Foto berhasil diunggah",
      url: publicUrl
    });
  } catch (error: any) {
    console.error("Upload avatar error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengunggah gambar" },
      { status: 500 }
    );
  }
}

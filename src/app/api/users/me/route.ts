import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, avatarUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID diperlukan" },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama tidak boleh kosong" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, any> = {
      name: name.trim(),
    };

    if (avatarUrl !== undefined) {
      updateFields.avatarUrl = avatarUrl;
    }

    const updated = userDb.update(id, updateFields);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const { password: _, ...safeUser } = updated;

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID diperlukan" },
        { status: 400 }
      );
    }

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: "Password saat ini harus diisi" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password baru minimal 6 karakter" },
        { status: 400 }
      );
    }

    const user = await userDb.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Password saat ini salah. Silakan coba lagi." },
        { status: 400 }
      );
    }

    // Update to new password
    await userDb.update(userId, { password: newPassword });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah. Silakan gunakan password baru pada sesi masuk berikutnya.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengubah password" },
      { status: 500 }
    );
  }
}

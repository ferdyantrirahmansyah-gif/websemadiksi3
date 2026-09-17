import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { userDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get("semadiksi_token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Belum terautentikasi" },
        { status: 401 }
      );
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau telah kedaluwarsa" },
        { status: 401 }
      );
    }

    const user = userDb.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

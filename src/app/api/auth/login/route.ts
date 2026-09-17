import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/db";
import { verifyPassword, signJwt } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identity, password } = body;

    if (!identity || !identity.trim()) {
      return NextResponse.json(
        { success: false, message: "Email / Nomor HP / NIM wajib diisi!" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password wajib diisi!" },
        { status: 400 }
      );
    }

    const cleanIdentity = identity.trim();
    
    // Find user in SQLite database
    let user = userDb.findByIdentity(cleanIdentity);

    // If still not found, try exact email search
    if (!user && cleanIdentity.includes("@")) {
      user = userDb.findByEmail(cleanIdentity);
    }

    // STRICT VALIDATION: If user is not found, REJECT LOGIN!
    // Do NOT auto-create user accounts!
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun belum terdaftar! Silakan lakukan pendaftaran akun terlebih dahulu melalui halaman Daftar."
        },
        { status: 404 }
      );
    }

    // Check if account is blocked by admin
    if (user.isBlocked === 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun Anda telah dinonaktifkan oleh administrator. Hubungi admin SEMADIKSI."
        },
        { status: 403 }
      );
    }

    // Verify Password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Password yang Anda masukkan salah!" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signJwt({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      token,
      user: safeUser
    });

    response.cookies.set("semadiksi_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Terjadi kesalahan server saat login." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/db";
import { signJwt } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, nim, angkatan, prodi, university, kipStatus } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama lengkap wajib diisi!" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Email atau kontak wajib diisi!" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter!" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists in Supabase database
    const existingUser = await userDb.findByEmail(cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email ini sudah terdaftar! Silakan langsung login." },
        { status: 409 }
      );
    }

    // Check if NIM already exists
    if (nim && nim.trim()) {
      const existingNim = await userDb.findByNim(nim.trim());
      if (existingNim) {
        return NextResponse.json(
          { success: false, message: `NIM ${nim.trim()} sudah terdaftar atas nama ${existingNim.name}!` },
          { status: 409 }
        );
      }
    }

    // If registered as KIP UNUSA, force university to Universitas Nahdlatul Ulama Surabaya
    const isKipUnusa = kipStatus === "KIP UNUSA" || kipStatus === "kipk";
    const assignedUniversity = isKipUnusa
      ? "Universitas Nahdlatul Ulama Surabaya"
      : (university?.trim() || "Universitas Nahdlatul Ulama Surabaya");

    const user = await userDb.create({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      nim: (nim || "").trim(),
      angkatan: (angkatan || new Date().getFullYear().toString()).trim(),
      prodi: (prodi || "Teknik Informatika").trim(),
      university: assignedUniversity,
      kipStatus: isKipUnusa ? "KIP UNUSA" : "Umum",
      verificationStatus: isKipUnusa ? "Pending" : "Verified",
      role: cleanEmail === "admin123@gmail.com" ? "admin" : "student",
      isBlocked: 0
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Gagal membuat pengguna baru di database" },
        { status: 500 }
      );
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const { password: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      message: "Pendaftaran akun berhasil! Silakan masuk dengan akun Anda.",
      user: safeUser,
      token
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
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Terjadi kesalahan pada server saat pendaftaran." },
      { status: 500 }
    );
  }
}

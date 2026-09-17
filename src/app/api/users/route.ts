import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const allUsers = await userDb.getAll();
    const safeUsers = allUsers.map(({ password, ...u }) => u);

    return NextResponse.json({
      success: true,
      users: safeUsers
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, verificationStatus, isBlocked, role } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const updated = await userDb.update(id, {
      verificationStatus,
      isBlocked,
      role
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { password: _, ...safeUser } = updated;

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: safeUser
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

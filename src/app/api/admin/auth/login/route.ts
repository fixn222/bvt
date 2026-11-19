import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { adminLoginSchema } from "@/lib/validations";
import { comparePassword, signAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensureInitialData } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = adminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid login credentials" },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    await connectToDatabase();
    await ensureInitialData();

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await comparePassword(password, admin.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    admin.lastLogin = new Date();
    await admin.save();

    const userPayload = {
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
    };

    const token = signAdminToken(userPayload);

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      user: userPayload,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/auth/login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

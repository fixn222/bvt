import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { IAdminUser } from "@/types";

const JWT_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  "bvtalent-default-jwt-secret-minimum-32-characters";
export const COOKIE_NAME = "bvtalent_session";
const SESSION_EXPIRY = 60 * 60 * 24; // 24 hours

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export function signAdminToken(user: IAdminUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: SESSION_EXPIRY }
  );
}

export function verifyAdminToken(token: string): IAdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IAdminUser;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the admin session from NextRequest cookies or Authorization header.
 */
export function getAdminFromRequest(req: NextRequest): IAdminUser | null {
  // Check cookie
  const cookie = req.cookies.get(COOKIE_NAME);
  if (cookie?.value) {
    const user = verifyAdminToken(cookie.value);
    if (user) return user;
  }

  // Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const user = verifyAdminToken(token);
    if (user) return user;
  }

  return null;
}

/**
 * Server-component helper using next/headers cookies
 */
export async function getServerAdminSession(): Promise<IAdminUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

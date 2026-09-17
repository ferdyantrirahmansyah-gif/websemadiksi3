import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "semadiksi-portal-secret-key-unusa-2025";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  // Support plain text legacy match if not bcrypt hashed
  if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
    return password === hash;
  }
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: {
  userId: string;
  email: string;
  name: string;
  role?: string;
  kipStatus?: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

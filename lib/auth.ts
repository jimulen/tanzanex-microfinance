import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireRole(token: string, role: string) {
  const decoded: any = verifyToken(token);
  if (!decoded) return false;
  return decoded.role === role || decoded.role === "admin";
}

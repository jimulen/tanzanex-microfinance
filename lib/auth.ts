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

export function getRole(req: Request) {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const decoded: any = verifyToken(token);
  return decoded?.role || null;
}

export function getOrgId(req: Request) {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const decoded: any = verifyToken(token);

  // Super-admin bypasses organization scoping
  if (decoded?.role === "super-admin") return null;

  return decoded?.organizationId || null;
}

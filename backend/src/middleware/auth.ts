import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "changeme") as any;
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
}



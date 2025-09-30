import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { email, name, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already in use" });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, password: hashed } });
  res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || "changeme", { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true, role: true } });
  res.json(me);
});

export default router;



import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const upsertSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 20));
  const q = String(req.query.q ?? "").trim();
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { company: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.client.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.client.count({ where }),
  ]);
  res.json({ items, total, page, pageSize });
});

router.get("/:id", async (req, res) => {
  const client = await prisma.client.findUnique({ where: { id: req.params.id } });
  if (!client) return res.status(404).json({ error: "Not found" });
  res.json(client);
});

router.post("/", async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const client = await prisma.client.create({ data: parsed.data });
  res.status(201).json(client);
});

router.put("/:id", async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  try {
    const client = await prisma.client.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(client);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;



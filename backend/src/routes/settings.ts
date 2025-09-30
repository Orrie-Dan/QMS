import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const settings = await prisma.setting.findMany();
  const obj: Record<string, string> = {};
  for (const s of settings) obj[s.key] = s.value;
  res.json(obj);
});

const updateSchema = z.record(z.string(), z.string());

router.put("/", requireAdmin, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const entries = Object.entries(parsed.data);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  res.json({ success: true });
});

export default router;



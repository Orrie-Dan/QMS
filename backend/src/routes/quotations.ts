import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Decimal } from "@prisma/client/runtime/library";

const router = Router();
router.use(requireAuth);

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().nonnegative(),
});

const upsertSchema = z.object({
  clientId: z.string().cuid(),
  date: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
  notes: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
  taxRate: z.number().nonnegative().max(1).optional().default(0),
});

function computeTotals(items: Array<{ quantity: number; unitPrice: number }>, taxRate: number) {
  const subtotalNum = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const taxNum = subtotalNum * taxRate;
  const totalNum = subtotalNum + taxNum;
  return {
    subtotal: new Decimal(subtotalNum.toFixed(2)),
    tax: new Decimal(taxNum.toFixed(2)),
    total: new Decimal(totalNum.toFixed(2)),
  };
}

async function nextQuotationNumber() {
  const last = await prisma.quotation.findFirst({ orderBy: { createdAt: "desc" } });
  const lastNum = last?.number ?? "Q-000000";
  const seq = Number(lastNum.split("-")[1] || 0) + 1;
  return `Q-${String(seq).padStart(6, "0")}`;
}

router.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 20));
  const q = String(req.query.q ?? "").trim();
  const where = q
    ? {
        OR: [
          { number: { contains: q } },
          { client: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};
  const [items, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.quotation.count({ where }),
  ]);
  res.json({ items, total, page, pageSize });
});

router.get("/:id", async (req, res) => {
  const quotation = await prisma.quotation.findUnique({ where: { id: req.params.id }, include: { client: true, items: true } });
  if (!quotation) return res.status(404).json({ error: "Not found" });
  res.json(quotation);
});

router.post("/", async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { clientId, date, validUntil, status, notes, items, taxRate } = parsed.data;
  const totals = computeTotals(items, taxRate);
  const number = await nextQuotationNumber();
  const quotation = await prisma.quotation.create({
    data: {
      number,
      clientId,
      date: date ? new Date(date) : undefined,
      validUntil: validUntil ? new Date(validUntil) : null,
      status,
      notes,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      items: {
        create: items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: new Decimal(it.unitPrice.toFixed(2)),
          total: new Decimal((it.quantity * it.unitPrice).toFixed(2)),
        })),
      },
    },
    include: { client: true, items: true },
  });
  res.status(201).json(quotation);
});

router.put("/:id", async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { clientId, date, validUntil, status, notes, items, taxRate } = parsed.data;
  const totals = computeTotals(items, taxRate);
  try {
    const quotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: {
        clientId,
        date: date ? new Date(date) : undefined,
        validUntil: validUntil ? new Date(validUntil) : null,
        status,
        notes,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        items: {
          deleteMany: {},
          create: items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: new Decimal(it.unitPrice.toFixed(2)),
            total: new Decimal((it.quantity * it.unitPrice).toFixed(2)),
          })),
        },
      },
      include: { client: true, items: true },
    });
    res.json(quotation);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.quotation.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;



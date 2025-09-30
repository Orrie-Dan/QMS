import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", async (_req, res) => {
  const [clientsCount, quotationsCount, recentQuotations, totals] = await Promise.all([
    prisma.client.count(),
    prisma.quotation.count(),
    prisma.quotation.findMany({ include: { client: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.quotation.aggregate({ _sum: { total: true }, _count: { _all: true } }),
  ]);

  res.json({
    stats: {
      clients: clientsCount,
      quotations: quotationsCount,
      totalRevenue: totals._sum.total ?? 0,
    },
    recentQuotations,
  });
});

export default router;



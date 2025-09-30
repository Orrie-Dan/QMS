import { Router } from "express";
import authRouter from "./auth.js";
import clientsRouter from "./clients.js";
import quotationsRouter from "./quotations.js";
import settingsRouter from "./settings.js";
import reportsRouter from "./reports.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/clients", clientsRouter);
router.use("/quotations", quotationsRouter);
router.use("/settings", settingsRouter);
router.use("/reports", reportsRouter);

export default router;



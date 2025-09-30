import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";

const app = express();

app.set("etag", false);
app.use((_, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;



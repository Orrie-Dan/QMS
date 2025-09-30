import { NextFunction, Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Not Found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  const status = (err as any)?.status || 500;
  const message = (err as any)?.message || "Internal Server Error";
  const details = (err as any)?.details;
  res.status(status).json({ error: message, details });
}

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}



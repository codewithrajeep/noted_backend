import { NextFunction, Request, Response } from "express";
import logger from "../lib/logger";
import { randomUUID } from "node:crypto";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const requestId = randomUUID();
  res.on("finish", () => {
    const responseTime = Date.now() - start;
    logger.info({
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
    });
  });
  next();
};

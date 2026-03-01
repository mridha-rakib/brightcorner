import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod/v4";

import { HTTPSTATUS } from "@/config/http.config.js";
import { ErrorCodeEnum } from "@/enums/error-code.enum.js";
import { env } from "@/env.js";
import { logger } from "@/middlewares/pino-logger.js";
import { AppError } from "@/utils/app-error.utils.js";

type ErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
  timestamp: string;
  path: string;
  requestId?: string;
  stack?: string;
};

function buildErrorPayload(
  req: Request,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
  stack?: string,
): ErrorPayload {
  const requestId = (req as { id?: string }).id;

  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      ...(details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(requestId ? { requestId } : {}),
    ...(stack ? { stack } : {}),
  };
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent)
    return;

  if (err instanceof ZodError) {
    const payload = buildErrorPayload(
      req,
      HTTPSTATUS.BAD_REQUEST,
      ErrorCodeEnum.VALIDATION_ERROR,
      "Validation failed",
      err.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })),
      env.NODE_ENV === "production" ? undefined : err.stack,
    );

    res.status(HTTPSTATUS.BAD_REQUEST).json(payload);
    return;
  }

  if (err instanceof AppError) {
    const payload = buildErrorPayload(
      req,
      err.statusCode,
      err.errorCode ?? ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      err.message,
      err.details,
      env.NODE_ENV === "production" ? undefined : err.stack,
    );

    if (err.statusCode >= HTTPSTATUS.INTERNAL_SERVER_ERROR) {
      logger.error({ err, path: req.originalUrl }, "Unhandled application error");
    }

    res.status(err.statusCode).json(payload);
    return;
  }

  const unknownError = err instanceof Error ? err : new Error("Unknown error");
  logger.error({ err: unknownError, path: req.originalUrl }, "Unhandled server error");

  const payload = buildErrorPayload(
    req,
    HTTPSTATUS.INTERNAL_SERVER_ERROR,
    ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    "Internal server error",
    undefined,
    env.NODE_ENV === "production" ? undefined : unknownError.stack,
  );

  res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json(payload);
}

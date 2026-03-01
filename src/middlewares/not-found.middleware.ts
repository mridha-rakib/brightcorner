import type { NextFunction, Request, Response } from "express";

import { HTTPSTATUS } from "@/config/http.config.js";
import { ErrorCodeEnum } from "@/enums/error-code.enum.js";

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(HTTPSTATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: ErrorCodeEnum.RESOURCE_NOT_FOUND,
      message: `Route ${req.method} ${req.originalUrl} not found`,
      statusCode: HTTPSTATUS.NOT_FOUND,
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}

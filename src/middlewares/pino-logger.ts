import type { Logger, LoggerOptions } from "pino";
import type { Options as PinoHttpOptions } from "pino-http";

import { randomUUID } from "node:crypto";
import pino from "pino";
import pinoHttp from "pino-http";

import { env } from "@/env.js";

const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.newPassword",
  "req.body.oldPassword",
  "req.body.token",
  "req.body.refreshToken",
  "res.headers['set-cookie']",
] as const;

export class LoggerService {
  private readonly loggerInstance: Logger;

  constructor(options: LoggerOptions = {}) {
    this.loggerInstance = pino(
      {
        level: env.LOG_LEVEL,
        timestamp: pino.stdTimeFunctions.isoTime,
        redact: { paths: [...REDACT_PATHS], remove: true },
        base: { app: env.APP_NAME, env: env.NODE_ENV },
        ...options,
      },
      this.buildTransport(),
    );
  }

  get logger(): Logger {
    return this.loggerInstance;
  }

  createHttpLogger() {
    const options: PinoHttpOptions = {
      logger: this.loggerInstance,
      genReqId: (req, res) => {
        const reqId = this.resolveRequestId(req);
        res.setHeader("X-Request-Id", reqId);
        return reqId;
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500)
          return "error";
        if (res.statusCode >= 400)
          return "warn";
        return "info";
      },
      customSuccessMessage: (req, res) => `${req.method} ${req.url} -> ${res.statusCode}`,
      customErrorMessage: (req, res, err) => `${req.method} ${req.url} -> ${res.statusCode} (${err?.message ?? "error"})`,
      autoLogging: {
        ignore: (req) => {
          const pathname = req.url?.split("?")[0] ?? "";
          return pathname === "/health";
        },
      },
      serializers: {
        req: req => ({
          id: (req as { id?: string }).id,
          method: req.method,
          url: req.url,
          remoteAddress: req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"],
        }),
        res: res => ({ statusCode: res.statusCode }),
        err: pino.stdSerializers.err,
      },
    };

    return pinoHttp(options);
  }

  private buildTransport() {
    if (env.NODE_ENV === "production")
      return undefined;

    return pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard",
      },
    });
  }

  private resolveRequestId(
    req: Parameters<NonNullable<PinoHttpOptions["genReqId"]>>[0],
  ): string {
    const candidate = req.headers["x-request-id"] ?? (req as { id?: string }).id;

    if (typeof candidate === "string" && candidate.length > 0)
      return candidate;

    if (Array.isArray(candidate) && candidate.length > 0)
      return candidate[0] ?? randomUUID();

    return randomUUID();
  }
}

const defaultLoggerService = new LoggerService();

export const logger = defaultLoggerService.logger;

export function pinoLogger() {
  return defaultLoggerService.createHttpLogger();
}

import type { CorsOptions } from "cors";
import type { Application } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { swaggerSpec, swaggerUi, swaggerUiOptions } from "@/config/swagger.config.js";
import { env } from "@/env.js";
import { errorHandler } from "@/middlewares/error-handler.middleware.js";
import { notFound } from "@/middlewares/not-found.middleware.js";
import { pinoLogger } from "@/middlewares/pino-logger.js";
import { globalRateLimit } from "@/middlewares/rate-limit.middleware.js";
import rootRouter from "@/routes/index.route.js";

class ApplicationFactory {
  private readonly app: Application;

  constructor(app: Application = express()) {
    this.app = app;
  }

  create(): Application {
    this.configureProxy();
    this.configureSecurity();
    this.configureParsers();
    this.configureObservability();
    this.configureRoutes();
    this.configureErrorHandling();

    return this.app;
  }

  private configureProxy(): void {
    if (env.TRUST_PROXY)
      this.app.set("trust proxy", 1);
  }

  private configureSecurity(): void {
    this.app.use(
      cors({
        origin: this.corsOrigin,
        credentials: true,
      }),
    );

    this.app.use(
      helmet({
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
      }),
    );

    this.app.use((_req, res, next) => {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      next();
    });

    this.app.use(globalRateLimit);
  }

  private configureParsers(): void {
    this.app.use(cookieParser());
    this.app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
    this.app.use(express.urlencoded({ extended: true, limit: env.URL_ENCODED_LIMIT }));
  }

  private configureObservability(): void {
    if (env.ENABLE_REQUEST_LOGGING)
      this.app.use(pinoLogger());
  }

  private configureRoutes(): void {
    this.app.get("/", (_req, res) => {
      res.status(200).json({
        success: true,
        message: "Bright Corner API",
        timestamp: new Date().toISOString(),
      });
    });

    this.app.get("/health", (_req, res) => {
      res.status(200).json({
        success: true,
        message: "OK",
        timestamp: new Date().toISOString(),
      });
    });

    if (env.ENABLE_SWAGGER) {
      this.app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions),
      );
    }

    this.app.use(env.BASE_URL, rootRouter);
  }

  private configureErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  private readonly corsOrigin: CorsOptions["origin"] = (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowAll = env.CORS_ORIGINS.includes("*");
    const isAllowed = allowAll || env.CORS_ORIGINS.includes(origin);

    if (isAllowed) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  };
}

const app = new ApplicationFactory().create();

export default app;

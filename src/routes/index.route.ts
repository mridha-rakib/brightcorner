import type { Request, Response } from "express";

import { Router } from "express";

import { ApiResponse } from "@/utils/response.utils.js";

class RootRouter {
  public readonly router = Router();

  constructor() {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get("/", this.getBaseRoute);
    this.router.get("/health", this.getHealthRoute);
  }

  private readonly getBaseRoute = (_req: Request, res: Response): void => {
    ApiResponse.success(res, { service: "Bright Corner API" }, "API is running");
  };

  private readonly getHealthRoute = (_req: Request, res: Response): void => {
    ApiResponse.success(res, { status: "ok" }, "Service is healthy");
  };
}

export default new RootRouter().router;

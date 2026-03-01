import type { NextFunction, Request, Response } from "express";

import { UnauthorizedException } from "@/utils/app-error.utils.js";

export type AuthenticatedUser = {
  id: string;
  role?: string;
};

export type AuthenticatedRequest = {
  user?: AuthenticatedUser;
} & Request;

export type AuthResolver = {
  resolve: (request: Request) => Promise<AuthenticatedUser | undefined>;
};

export class NoopAuthResolver implements AuthResolver {
  async resolve(_request: Request): Promise<AuthenticatedUser | undefined> {
    return undefined;
  }
}

export class AuthMiddleware {
  constructor(
    private readonly resolver: AuthResolver = new NoopAuthResolver(),
    private readonly required = false,
  ) {}

  public handle = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.resolver.resolve(req);

      if (!user && this.required) {
        next(new UnauthorizedException("Authentication required"));
        return;
      }

      req.user = user;
      next();
    }
    catch (error) {
      next(error);
    }
  };
}

export const optionalAuth = new AuthMiddleware().handle;
export const requiredAuth = new AuthMiddleware(new NoopAuthResolver(), true).handle;

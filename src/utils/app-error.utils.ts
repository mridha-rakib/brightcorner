import type { HttpStatusCodeType } from "@/config/http.config.js";
import type { ErrorCodeEnumType } from "@/enums/error-code.enum.js";

import { HTTPSTATUS } from "@/config/http.config.js";
import { ErrorCodeEnum } from "@/enums/error-code.enum.js";

export type AppErrorOptions = {
  statusCode?: HttpStatusCodeType;
  errorCode?: ErrorCodeEnumType;
  details?: unknown;
  cause?: unknown;
};

export class AppError extends Error {
  public readonly statusCode: HttpStatusCodeType;
  public readonly errorCode: ErrorCodeEnumType;
  public readonly details?: unknown;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause as Error | undefined });
    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? HTTPSTATUS.INTERNAL_SERVER_ERROR;
    this.errorCode = options.errorCode ?? ErrorCodeEnum.INTERNAL_SERVER_ERROR;
    this.details = options.details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
  constructor(
    message = "Http exception",
    statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCodeEnumType = ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    super(message, { statusCode, errorCode, details });
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal server error", details?: unknown) {
    super(message, {
      statusCode: HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      details,
    });
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(message, {
      statusCode: HTTPSTATUS.NOT_FOUND,
      errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
      details,
    });
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(message, {
      statusCode: HTTPSTATUS.BAD_REQUEST,
      errorCode: ErrorCodeEnum.VALIDATION_ERROR,
      details,
    });
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, {
      statusCode: HTTPSTATUS.UNAUTHORIZED,
      errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
      details,
    });
  }
}

export class ConflictException extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, {
      statusCode: HTTPSTATUS.CONFLICT,
      errorCode: ErrorCodeEnum.RESOURCE_CONFLICT,
      details,
    });
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, {
      statusCode: HTTPSTATUS.FORBIDDEN,
      errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
      details,
    });
  }
}

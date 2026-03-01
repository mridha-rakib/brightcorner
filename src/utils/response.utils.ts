import type { Response } from "express";

import { HTTPSTATUS } from "@/config/http.config.js";

export type ApiSuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
  timestamp: string;
};

export type PaginationMeta = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type ApiPaginatedEnvelope<T> = {
  pagination: PaginationMeta;
} & ApiSuccessEnvelope<T[]>;

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode: number = HTTPSTATUS.OK,
  ) {
    const payload: ApiSuccessEnvelope<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(payload);
  }

  static created<T>(
    res: Response,
    data: T,
    message = "Resource created successfully",
  ) {
    return this.success(res, data, message, HTTPSTATUS.CREATED);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message = "Success",
    statusCode: number = HTTPSTATUS.OK,
  ) {
    const payload: ApiPaginatedEnvelope<T> = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(payload);
  }

  static noContent(res: Response) {
    return res.status(HTTPSTATUS.NO_CONTENT).send();
  }
}

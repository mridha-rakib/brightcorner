import type { PaginationMeta } from "@/utils/response.utils.js";

import { paginateConfig } from "@/config/paginate.config.js";

export type PaginationInput = {
  page?: string | number;
  limit?: string | number;
};

export type NormalizedPagination = {
  page: number;
  limit: number;
  skip: number;
};

export function normalizePagination(input: PaginationInput): NormalizedPagination {
  const page = Number(input.page ?? paginateConfig.defaultPage);
  const limit = Number(input.limit ?? paginateConfig.defaultLimit);

  const safePage = Number.isFinite(page) && page > 0
    ? Math.floor(page)
    : paginateConfig.defaultPage;

  const safeLimit = Number.isFinite(limit) && limit > 0
    ? Math.min(Math.floor(limit), paginateConfig.maxLimit)
    : paginateConfig.defaultLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function toPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

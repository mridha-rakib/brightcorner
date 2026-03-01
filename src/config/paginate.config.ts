export type PaginateConfig = {
  defaultPage: number;
  defaultLimit: number;
  maxLimit: number;
};

export const paginateConfig: PaginateConfig = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

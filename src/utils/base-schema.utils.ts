import { z } from "zod/v4";

export const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, "Invalid object id");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

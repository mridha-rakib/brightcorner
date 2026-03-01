import { env } from "@/env.js";

export const APP_CONSTANTS = {
  NAME: env.APP_NAME,
  BASE_URL: env.BASE_URL,
  VERSION: "1.0.0",
} as const;

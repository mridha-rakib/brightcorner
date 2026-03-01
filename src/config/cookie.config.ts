import { env } from "@/env.js";

export const cookieConfig = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
} as const;

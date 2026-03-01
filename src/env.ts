import { z } from "zod/v4";

const logLevelSchema = z.enum([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeEnv(rawEnv: NodeJS.ProcessEnv): Record<string, string> {
  const normalized: Record<string, string> = {};

  Object.entries(rawEnv).forEach(([key, value]) => {
    if (typeof value !== "string")
      return;

    const trimmed = value.trim();
    const unquoted = trimmed.replace(/^(['"])(.*)\1$/, "$2");
    normalized[key] = unquoted;
  });

  return normalized;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().trim().min(1).default("Bright Corner API"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  BASE_URL: z
    .string()
    .trim()
    .default("/api/v1")
    .transform((value) => {
      if (!value.startsWith("/"))
        return `/${value}`;
      return value.length > 1 ? value.replace(/\/+$/, "") : value;
    }),
  LOG_LEVEL: logLevelSchema.default("info"),
  JSON_BODY_LIMIT: z.string().trim().default("1mb"),
  URL_ENCODED_LIMIT: z.string().trim().default("1mb"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:3001")
    .transform(parseCsv),
  TRUST_PROXY: z.stringbool().default(false),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(100),
  ENABLE_SWAGGER: z.stringbool().default(true),
  ENABLE_REQUEST_LOGGING: z.stringbool().default(true),

  MONGO_URI: z.string().url().optional(),
  JWT_SECRET: z.string().min(1).optional(),
  JWT_REFRESH_SECRET: z.string().min(1).optional(),
  CLIENT_URL: z.string().url().optional(),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== "production")
    return;

  const requiredInProduction = [
    { key: "MONGO_URI", value: value.MONGO_URI },
    { key: "JWT_SECRET", value: value.JWT_SECRET },
    { key: "JWT_REFRESH_SECRET", value: value.JWT_REFRESH_SECRET },
  ] as const;

  requiredInProduction.forEach(({ key, value: configValue }) => {
    if (configValue)
      return;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [key],
      message: `${key} is required in production`,
    });
  });
});

export type Env = z.infer<typeof envSchema>;

export class EnvironmentConfig {
  public readonly values: Env;

  constructor(rawEnv: NodeJS.ProcessEnv) {
    const normalized = normalizeEnv(rawEnv);
    const parsed = envSchema.safeParse(normalized);

    if (!parsed.success) {
      const readableIssues = parsed.error.issues.map(issue => ({
        key: issue.path.join("."),
        message: issue.message,
      }));

      throw new Error(
        `Invalid environment configuration: ${JSON.stringify(readableIssues)}`,
      );
    }

    this.values = parsed.data;
  }
}

function getRuntimeEnv(): NodeJS.ProcessEnv {
  const runtimeProcess = globalThis.process as NodeJS.Process | undefined;
  return runtimeProcess?.env ?? {};
}

export const env: Env = (() => {
  try {
    return new EnvironmentConfig(getRuntimeEnv()).values;
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

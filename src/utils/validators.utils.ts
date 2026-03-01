import type { Request } from "express";
import type { z, ZodTypeAny } from "zod/v4";

import { ZodError } from "zod/v4";

export type RequestPick = "body" | "query" | "params" | "cookies" | "headers" | "all";

export type ZParseOptions = {
  pick?: RequestPick;
  message?: string;
};

export function buildReqInput(req: Request) {
  return {
    body: req.body,
    query: req.query,
    params: req.params,
    cookies: req.cookies,
    headers: req.headers,
  } as const;
}

function pickPayload(input: ReturnType<typeof buildReqInput>, pick: RequestPick) {
  if (pick === "all")
    return input;

  return { [pick]: input[pick] } as Record<string, unknown>;
}

export async function zParse<TSchema extends ZodTypeAny>(
  schema: TSchema,
  req: Request,
  options: ZParseOptions = {},
): Promise<z.infer<TSchema>> {
  const { pick = "all", message = "Validation failed" } = options;

  try {
    return await schema.parseAsync(pickPayload(buildReqInput(req), pick));
  }
  catch (error) {
    if (error instanceof ZodError)
      throw error;

    throw new Error(message, { cause: error as Error });
  }
}

export async function zSafeParse<TSchema extends ZodTypeAny>(
  schema: TSchema,
  req: Request,
  options: Omit<ZParseOptions, "message"> = {},
): Promise<
  | { success: true; data: z.infer<TSchema> }
  | { success: false; error: ZodError }
> {
  const { pick = "all" } = options;
  const result = await schema.safeParseAsync(pickPayload(buildReqInput(req), pick));

  if (result.success)
    return { success: true, data: result.data };

  return { success: false, error: result.error };
}

import swaggerUi from "swagger-ui-express";

import { env } from "@/env.js";

const apiBaseUrl = env.BASE_URL === "/" ? "" : env.BASE_URL;

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: env.APP_NAME,
    version: "1.0.0",
    description: "API bootstrap specification",
  },
  servers: [{ url: apiBaseUrl || "/" }],
  tags: [{ name: "Health", description: "Service availability endpoints" }],
  paths: {
    [`${apiBaseUrl}/health`]: {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerUiOptions = {
  explorer: true,
};

export { swaggerUi };

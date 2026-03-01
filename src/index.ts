import type { AddressInfo } from "node:net";

import app from "@/app.js";
import { bootstrapApplication } from "@/config/bootstrap.config.js";
import { env } from "@/env.js";
import { logger } from "@/middlewares/pino-logger.js";

async function startServer() {
  await bootstrapApplication();

  const server = app.listen(env.PORT, () => {
    const address = server.address() as AddressInfo | null;
    const port = address?.port ?? env.PORT;
    logger.info(`Server listening on http://localhost:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      logger.error(`Port ${env.PORT} is already in use.`);
    }
    else {
      logger.error({ err: error }, "Failed to start server");
    }
    process.exit(1);
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info(`${signal} received. Closing server.`);
    server.close((closeError) => {
      if (closeError) {
        logger.error({ err: closeError }, "Error while closing server");
        process.exit(1);
      }

      logger.info("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((error) => {
  logger.error({ err: error }, "Fatal startup error");
  process.exit(1);
});

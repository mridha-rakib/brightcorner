import { logger } from "@/middlewares/pino-logger.js";

export type DatabaseConnector = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

export class NoopDatabaseConnector implements DatabaseConnector {
  async connect(): Promise<void> {
    logger.info("Database connector not configured yet; skipping connection.");
  }

  async disconnect(): Promise<void> {
    logger.info("Database connector not configured yet; skipping disconnect.");
  }
}

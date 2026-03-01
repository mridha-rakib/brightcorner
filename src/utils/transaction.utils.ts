export type TransactionSession = {
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  end: () => Promise<void>;
};

export type TransactionProvider = {
  start: () => Promise<TransactionSession>;
};

export class TransactionHelper {
  static async withTransaction<T>(
    provider: TransactionProvider,
    callback: (session: TransactionSession) => Promise<T>,
  ): Promise<T> {
    const session = await provider.start();

    try {
      const result = await callback(session);
      await session.commit();
      return result;
    }
    catch (error) {
      await session.rollback();
      throw error;
    }
    finally {
      await session.end();
    }
  }
}

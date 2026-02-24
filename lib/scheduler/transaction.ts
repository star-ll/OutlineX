export type TransactionTaskUndo<T> = (context: T) => void | Promise<void>;

export type TransactionTask<T> = (
  context: T,
) => void | TransactionTaskUndo<T> | Promise<void | TransactionTaskUndo<T>>;

type TransactionQueuedTask<T> = {
  taskName: string;
  callback: TransactionTask<T>;
};

export type TransactionFailure = {
  phase: "apply" | "rollback";
  taskName: string;
  error: unknown;
};

export class TransactionApplyError extends Error {
  rolledBack: boolean;
  failures: TransactionFailure[];

  constructor(failures: TransactionFailure[], rolledBack: boolean) {
    super("[Transaction error]: transaction apply failed");
    this.name = "TransactionApplyError";
    this.failures = failures;
    this.rolledBack = rolledBack;
  }
}

export class Transaction<C extends Record<string | number | symbol, any>> {
  queue: TransactionQueuedTask<C>[] = [];
  undoStack: TransactionTaskUndo<C>[] = [];
  isRunning = false;

  add(taskName: string, callback: TransactionTask<C>) {
    if (this.isRunning) {
      throw new Error(`[Transaction error]: Transaction flushing...`);
    }

    const normalizedTaskName = taskName.trim();
    if (!normalizedTaskName) {
      throw new Error(`[Transaction error]: taskName is required`);
    }

    this.queue.push({
      taskName: normalizedTaskName,
      callback,
    });
  }

  async apply() {
    if (this.isRunning) {
      throw new Error("[Transaction error]: Transaction is running");
    }

    const context: C = {} as C;
    let currentTaskName = "";
    this.isRunning = true;
    try {
      for (const task of this.queue) {
        currentTaskName = task.taskName;
        const undo = await task.callback(context);
        if (undo) {
          this.undoStack.push(undo);
        }
      }
    } catch (err) {
      const failures: TransactionFailure[] = [
        {
          phase: "apply",
          taskName: currentTaskName,
          error: err,
        },
      ];
      console.error(
        `[Transaction error]: execute task ${currentTaskName} error, will rollback`,
      );
      console.error(err);
      const rollbackFailures = await this._rollback(context);
      failures.push(...rollbackFailures);

      throw new TransactionApplyError(failures, rollbackFailures.length === 0);
    } finally {
      this.clear();
      this.isRunning = false;
    }
  }

  private async _rollback(context: C) {
    const rollbackFailures: TransactionFailure[] = [];

    while (this.undoStack.length) {
      const undo = this.undoStack.pop()!;
      const undoName = undo.name || "anonymous-undo";
      try {
        await undo(context);
      } catch (err) {
        console.error(
          `[Transaction error]: execute undo function ${undoName} error`,
        );
        console.error(err);
        rollbackFailures.push({
          phase: "rollback",
          taskName: undoName,
          error: err,
        });
      }
    }

    return rollbackFailures;
  }

  clear() {
    this.queue.length = 0;
    this.undoStack.length = 0;
  }
}

import { Transaction, TransactionApplyError } from "@/lib/scheduler/transaction";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function verifyTransactionAppliesTasksInOrder() {
  type Context = { order: string[] };
  const transaction = new Transaction<Context>();
  let capturedContext: Context | null = null;

  transaction.add("first-task", (context) => {
    capturedContext = context;
    context.order = ["first"];
  });
  transaction.add("second-task", (context) => {
    context.order.push("second");
  });

  await transaction.apply();

  if (!capturedContext) {
    throw new Error("Transaction context was not captured.");
  }

  if (capturedContext.order.join(",") !== "first,second") {
    throw new Error(
      `Unexpected transaction order: ${capturedContext.order.join(",")}`,
    );
  }
}

export async function verifyTransactionRollsBackOnTaskFailure() {
  const transaction = new Transaction<Record<string, unknown>>();
  const events: string[] = [];

  transaction.add("write-main", () => {
    events.push("do-main");
    return () => {
      events.push("undo-main");
    };
  });
  transaction.add("throw-error", () => {
    events.push("do-error");
    throw new Error("expected failure");
  });

  let rejected: unknown = null;
  try {
    await transaction.apply();
  } catch (error) {
    rejected = error;
  }

  if (events.join(",") !== "do-main,do-error,undo-main") {
    throw new Error(`Unexpected rollback events: ${events.join(",")}`);
  }

  if (!(rejected instanceof TransactionApplyError)) {
    throw new Error("Expected apply() to reject with TransactionApplyError.");
  }

  if (!rejected.rolledBack) {
    throw new Error("Expected rolledBack=true when rollback succeeds.");
  }

  if (rejected.failures.length !== 1) {
    throw new Error(
      `Expected 1 failure entry, got ${String(rejected.failures.length)}.`,
    );
  }

  if (rejected.failures[0]?.phase !== "apply") {
    throw new Error("Expected first failure phase to be apply.");
  }

  if (rejected.failures[0]?.taskName !== "throw-error") {
    throw new Error(
      `Unexpected failed taskName: ${String(rejected.failures[0]?.taskName)}.`,
    );
  }
}

export async function verifyTransactionRejectsAddDuringApply() {
  const transaction = new Transaction<Record<string, unknown>>();
  let threw = false;

  transaction.add("slow-task", async () => {
    await sleep(20);
  });

  const applyPromise = transaction.apply();
  try {
    transaction.add("late-task", () => {});
  } catch {
    threw = true;
  }

  await applyPromise;

  if (!threw) {
    throw new Error("Expected add() to throw while transaction is flushing.");
  }
}

export async function verifyTransactionRejectsEmptyTaskName() {
  const transaction = new Transaction<Record<string, unknown>>();
  let threw = false;

  try {
    transaction.add("  ", () => {});
  } catch {
    threw = true;
  }

  if (!threw) {
    throw new Error("Expected add() to reject empty taskName.");
  }
}

import { AsyncSerialQueue } from "@/lib/algorithms/async-serial-queue";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function verifyAsyncSerialQueueOrder() {
  const queue = new AsyncSerialQueue();
  const events: number[] = [];

  const first = queue.enqueue(async () => {
    await sleep(20);
    events.push(1);
    return 1;
  });

  const second = queue.enqueue(async () => {
    events.push(2);
    return 2;
  });

  const third = queue.enqueue(async () => {
    events.push(3);
    return 3;
  });

  const values = await Promise.all([first, second, third]);

  if (values.join(",") !== "1,2,3") {
    throw new Error(`Unexpected queue values: ${values.join(",")}`);
  }

  if (events.join(",") !== "1,2,3") {
    throw new Error(`Unexpected queue order: ${events.join(",")}`);
  }
}

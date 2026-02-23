export type AsyncQueueTask<T> = () => Promise<T> | T;

type QueueItem<T> = {
  task: AsyncQueueTask<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

export class AsyncSerialQueue {
  private queue: QueueItem<unknown>[] = [];
  private running = false;

  get size() {
    return this.queue.length;
  }

  get isRunning() {
    return this.running;
  }

  enqueue<T>(task: AsyncQueueTask<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        task: task as AsyncQueueTask<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.runNext();
    });
  }

  private runNext() {
    if (this.running) {
      return;
    }

    const item = this.queue.shift();
    if (!item) {
      return;
    }

    this.running = true;

    Promise.resolve()
      .then(() => item.task())
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        this.running = false;
        this.runNext();
      });
  }
}

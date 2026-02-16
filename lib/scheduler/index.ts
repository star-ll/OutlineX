import { SchedulerId } from "@/types/scheduler";
import { MinHeap } from "../algorithms/heap";

type TaskCallback = (...args: any[]) => unknown;

class SchedulerTask {
  id: SchedulerId;
  priority: number;
  callback: TaskCallback;
  expiredTime?: number;

  constructor(id: SchedulerId, priority: number, callback: TaskCallback) {
    this.id = id;
    this.priority = priority;
    this.callback = callback;
  }
}

type _SchedulerTask = SchedulerTask & { expiredTime: number };

type SchedulerPushTask = {
  id: SchedulerId;
  priority?: Priority;
  delayMs?: number;
  callback: TaskCallback;
};

export const enum Priority {
  Sync = 0,
  Input = 5,
  Default = 10,
  NextFrame = 30,
  Idle = 50,
}

export class Scheduler {
  private timeQueue = new MinHeap<_SchedulerTask>(
    (a: _SchedulerTask, b: _SchedulerTask) => a.expiredTime - b.expiredTime,
  );
  private taskQueue = new MinHeap<_SchedulerTask>(
    (a: _SchedulerTask, b: _SchedulerTask) =>
      a.priority === b.priority
        ? a.expiredTime - b.expiredTime
        : a.priority - b.priority,
  );

  private timeSliceMs = 5;

  private isFlush = false;
  private flushScheduled = false;
  private scheduleTimer?: ReturnType<typeof setTimeout>;
  private scheduleTimestamp = 0;

  taskIdMap = new Map<SchedulerId, _SchedulerTask>();

  hasTaskById(id: SchedulerId) {
    return this.taskIdMap.has(id);
  }

  cancel(id: SchedulerId) {
    this.taskIdMap.delete(id);
  }

  push(task: SchedulerPushTask) {
    const schedulerTask = new SchedulerTask(
      task.id,
      task.priority ?? Priority.Default,
      task.callback,
    );

    schedulerTask.expiredTime = getNow() + (task.delayMs ?? 0);
    if (schedulerTask.priority === Priority.NextFrame) {
      schedulerTask.expiredTime += 16;
    } else if (schedulerTask.priority === Priority.Idle) {
      schedulerTask.expiredTime += 50;
    }

    const normalizedTask = schedulerTask as _SchedulerTask;
    this.taskIdMap.set(normalizedTask.id, normalizedTask);

    if (normalizedTask.priority === Priority.Sync) {
      this.taskQueue.push(normalizedTask);
      this.flush();
    } else {
      this.timeQueue.push(normalizedTask);
      this.peekTimeQueue();
    }
  }

  private requestFlush() {
    if (this.flushScheduled) {
      return;
    }

    this.flushScheduled = true;
    setTimeout(() => {
      this.flushScheduled = false;
      this.flush();
    }, 0);
  }

  private flush() {
    if (this.isFlush) {
      return;
    }

    let shouldPeek = true;
    try {
      this.isFlush = true;
      let now = getNow();
      while (!this.taskQueue.isEmpty()) {
        const task = this.taskQueue.pop()!;
        if (this.taskIdMap.get(task.id) !== task) {
          continue;
        }

        this.taskIdMap.delete(task.id);
        try {
          const result = task.callback();
          if (isPromiseLike(result)) {
            result.catch((err) => {
              console.error(err);
            });
          }

          if (!this.flushScheduled && getNow() - now > this.timeSliceMs) {
            // console.warn(`[Scheduler]: Scheduler execute timeout!`);
            shouldPeek = false;
            this.requestFlush();
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(`[Scheduler Error]:` + err);
    } finally {
      this.isFlush = false;
      if (shouldPeek) {
        this.peekTimeQueue();
      }
    }
  }

  private peekTimeQueue() {
    let headTask = this.timeQueue.peek();
    while (headTask && this.taskIdMap.get(headTask.id) !== headTask) {
      this.timeQueue.pop();
      headTask = this.timeQueue.peek();
    }

    if (!headTask) {
      return;
    }

    if (this.scheduleTimer != null) {
      if (headTask.expiredTime < this.scheduleTimestamp) {
        clearTimeout(this.scheduleTimer);
      } else {
        return;
      }
    }

    const start = getNow();
    const delay = Math.max(0, headTask.expiredTime - start);

    this.scheduleTimestamp = headTask.expiredTime;
    this.scheduleTimer = setTimeout(() => {
      this.scheduleTimer = undefined;

      while (!this.timeQueue.isEmpty()) {
        const task = this.timeQueue.peek()!;
        if (task.expiredTime > getNow()) {
          break;
        }

        const movedTask = this.timeQueue.pop()!;
        if (this.taskIdMap.get(movedTask.id) === movedTask) {
          this.taskQueue.push(movedTask);
        }
      }

      this.flush();
    }, delay);
  }
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    value != null &&
    typeof value === "object" &&
    "then" in value &&
    typeof (value as Promise<unknown>).then === "function"
  );
}

export function getNow() {
  const perfNow = globalThis.performance?.now;
  if (typeof perfNow === "function") {
    return perfNow.call(globalThis.performance);
  }

  return Date.now();
}

export type MinHeapCompare<T> = (a: T, b: T) => number;

export class MinHeap<T> {
  private readonly queue: T[] = [];
  private compare: MinHeapCompare<T>;

  constructor(compare: MinHeapCompare<T>) {
    this.compare = compare;
  }

  private _siftDown(index: number) {
    let i = index;
    while (true) {
      let next = i;
      let l = i * 2 + 1;
      let r = i * 2 + 2;

      if (l < this.len() && this.compare(this.queue[l], this.queue[next]) < 0) {
        next = l;
      }
      if (r < this.len() && this.compare(this.queue[r], this.queue[next]) < 0) {
        next = r;
      }

      if (next !== i) {
        [this.queue[next], this.queue[i]] = [this.queue[i], this.queue[next]];
        i = next;
      } else {
        break;
      }
    }
  }

  private _siftUp(index: number) {
    let i = index;
    while (i > 0) {
      let parent = Math.floor((i - 1) / 2);
      if (parent >= 0 && this.compare(this.queue[i], this.queue[parent]) < 0) {
        [this.queue[parent], this.queue[i]] = [
          this.queue[i],
          this.queue[parent],
        ];
        i = parent;
      } else {
        break;
      }
    }
  }

  len(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.len() === 0;
  }

  peek(): T | undefined {
    return this.isEmpty() ? undefined : this.queue[0];
  }

  push(val: T): void {
    this.queue.push(val);
    this._siftUp(this.len() - 1);
  }

  pop(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    if (this.len() === 1) {
      return this.queue.pop();
    }

    const head = this.queue[0];
    this.queue[0] = this.queue.pop()!;
    this._siftDown(0);
    return head;
  }

  clear(): void {
    this.queue.length = 0;
  }
}

export class KeySet {
  private keys: Map<number, number>;
  private free: number[];
  private nextKeyValue: number;

  constructor(from = 0, to = 0) {
    this.keys = new Map<number, number>();
    this.free = [];
    this.nextKeyValue = 0;
    this.reset(from, to);
  }

  next(): number {
    if (this.free.length) {
      return this.free.pop()!;
    } else {
      return this.nextKeyValue++;
    }
  }

  reset(from: number, to: number) {
    this.keys.forEach((keyValue, rowIndex) => {
      if (rowIndex < from || rowIndex >= to) {
        this.free.push(keyValue);
        this.keys.delete(rowIndex);
      }
    });

    const size = to - from;
    if (this.keys.size + this.free.length > size) {
      this.free.length = size - this.keys.size;
    }

    for (let rowIndex = from; rowIndex < to; rowIndex++) {
      if (!this.keys.has(rowIndex)) {
        const nextKeyValue = this.next();
        this.keys.set(rowIndex, nextKeyValue);
      }
    }
  }

  keyFor(rowIndex: number) {
    return this.keys.get(rowIndex);
  }
}

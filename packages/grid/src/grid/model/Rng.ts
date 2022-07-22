export function range(
  ...args: [number] | [number, number] | [number, number, number]
): number[] {
  let start = 0;
  let end = 0;
  let step = 1;
  if (args.length < 2) {
    end = args[0];
  } else {
    start = args[0];
    end = args[1]!;
    if (args.length > 2) {
      step = args[2]!;
    }
  }
  return [...Array(end - start).keys()].map((i) => start + i * step);
}

export class Rng {
  public readonly start: number;
  public readonly end: number;

  public constructor(start: number, end: number) {
    if (end < start) {
      throw new Error(`Invalid start and end: [${start}, ${end}]`);
    }
    this.start = start;
    this.end = end;
  }

  public get length(): number {
    return this.end - this.start;
  }

  public map<T>(fn: (i: number) => T): T[] {
    return range(this.start, this.end).map(fn);
  }

  public forEach(fn: (i: number) => void): void {
    range(this.start, this.end).forEach(fn);
  }

  public *[Symbol.iterator]() {
    for (let i = this.start; i < this.end; ++i) {
      yield i;
    }
  }

  public static equals(a: Rng | undefined, b: Rng | undefined) {
    if (!a) {
      return !b;
    }
    return !b ? false : a.start === b.start && a.end === b.end;
  }

  public update(start: number, end: number) {
    return this.end !== end || this.start !== start
      ? new Rng(start, end)
      : this;
  }

  public static empty: Rng = new Rng(0, 0);

  public toString() {
    return `[${this.start}, ${this.end}]`;
  }

  public contains(n: number) {
    return this.start <= n && n < this.end;
  }
}

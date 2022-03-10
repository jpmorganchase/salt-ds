export type Listener<T> = (newValue: T, oldValue?: T) => void;

export class ValueStream<T> {
  private value?: T;
  private readonly listeners: Listener<T>[] = [];
  // TODO this is for debugging only
  public readonly name: string;

  constructor(name: string, value?: T) {
    this.name = name;
    this.value = value;
  }

  public getCurrent = () => this.value;

  public listen(listener: (value: T, oldValue?: T) => void) {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx !== -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }

  public push(value: T) {
    const oldValue = this.value;
    this.value = value;
    if (this.value !== oldValue) {
      this.listeners.forEach((listener) => {
        listener(value, oldValue);
      });
    }
  }
}

// TODO this is for debugging only
function combineNames(names: Array<string | undefined>) {
  return names.filter((x) => x != undefined).join("+");
}

export function combineStreams<A, B, C = any, D = any>(
  a: ValueStream<A>,
  b: ValueStream<B>,
  c?: ValueStream<C>,
  d?: ValueStream<D>
) {
  const combined = new ValueStream<
    [A | undefined, B | undefined, C | undefined, D | undefined]
  >(combineNames([a.name, b.name, c?.name, d?.name]));
  a.listen((x) =>
    combined.push([x, b.getCurrent(), c?.getCurrent(), d?.getCurrent()])
  );
  b.listen((x) =>
    combined.push([a.getCurrent(), x, c?.getCurrent(), d?.getCurrent()])
  );
  if (c) {
    c.listen((x) =>
      combined.push([a.getCurrent(), b.getCurrent(), x, d?.getCurrent()])
    );
  }
  if (d) {
    d.listen((x) =>
      combined.push([a.getCurrent(), b.getCurrent(), c?.getCurrent(), x])
    );
  }
  return combined;
}

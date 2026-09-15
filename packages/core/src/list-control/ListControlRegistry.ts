import type { OptionValue } from "./ListControlContext";

export interface RegisteredOption<Item> {
  data: OptionValue<Item>;
  element: HTMLElement;
}

interface RegistryEntry<Item> extends RegisteredOption<Item> {
  generation: number;
}

export function createCoalescedRebuild(
  rebuild: () => void,
  enqueue: (callback: () => void) => void = (callback) => {
    // Promise jobs are supported by Chrome 86.
    Promise.resolve().then(callback);
  },
): { schedule: () => void; cancel: () => void } {
  let pending = false;
  let cancelled = false;

  return {
    schedule() {
      if (pending || cancelled) return;
      pending = true;
      enqueue(() => {
        pending = false;
        if (!cancelled) rebuild();
      });
    },
    cancel() {
      cancelled = true;
      pending = false;
    },
  };
}

/** Internal option registry optimized for large, non-virtualized lists. */
export class ListControlRegistry<Item> {
  readonly #entries = new Map<string, RegistryEntry<Item>>();
  #ordered: (RegistryEntry<Item> | undefined)[] = [];
  #indexById = new Map<string, number>();
  #nextGeneration = 0;
  #hasGaps = false;

  register(option: OptionValue<Item>, element: HTMLElement): () => void {
    const entry: RegistryEntry<Item> = {
      data: option,
      element,
      generation: this.#nextGeneration++,
    };
    this.#entries.set(option.id, entry);

    const currentIndex = this.#indexById.get(option.id);
    if (currentIndex === undefined) {
      this.#indexById.set(option.id, this.#ordered.length);
      this.#ordered.push(entry);
    } else {
      this.#ordered[currentIndex] = entry;
    }

    return () => {
      const current = this.#entries.get(option.id);
      if (current?.generation !== entry.generation) {
        return;
      }
      this.#entries.delete(option.id);

      const index = this.#indexById.get(option.id);
      if (index !== undefined && this.#ordered[index] === entry) {
        // Rebuild compacts the snapshot after the corresponding DOM removal.
        this.#ordered[index] = undefined;
        this.#indexById.delete(option.id);
        this.#hasGaps = true;
      }
    };
  }

  rebuild(listElement: Pick<HTMLElement, "querySelectorAll">): void {
    const ordered: RegistryEntry<Item>[] = [];
    const indexById = new Map<string, number>();

    for (const element of listElement.querySelectorAll<HTMLElement>(
      '[role="option"]',
    )) {
      const entry = this.#entries.get(element.id);
      if (entry?.element === element && element.isConnected) {
        indexById.set(entry.data.id, ordered.length);
        ordered.push(entry);
      }
    }

    for (const id of this.#entries.keys()) {
      if (!indexById.has(id)) {
        this.#entries.delete(id);
      }
    }

    this.#ordered = ordered;
    this.#indexById = indexById;
    this.#hasGaps = false;
  }

  getAt(index: number): RegisteredOption<Item> | undefined {
    if (!this.#hasGaps) {
      return this.#ordered[index];
    }

    let currentIndex = 0;
    for (const entry of this.#ordered) {
      if (entry && this.#entries.get(entry.data.id) === entry) {
        if (currentIndex === index) return entry;
        currentIndex++;
      }
    }
    return undefined;
  }

  get length(): number {
    return this.#hasGaps ? this.#entries.size : this.#ordered.length;
  }

  indexOfId(id: string): number {
    const physicalIndex = this.#indexById.get(id);
    if (physicalIndex === undefined || !this.#hasGaps) {
      return physicalIndex ?? -1;
    }

    let logicalIndex = 0;
    for (let index = 0; index < physicalIndex; index++) {
      const entry = this.#ordered[index];
      if (entry && this.#entries.get(entry.data.id) === entry) logicalIndex++;
    }
    return logicalIndex;
  }

  indexOfValue(value: Item): number {
    let logicalIndex = 0;
    for (const entry of this.#ordered) {
      if (entry && this.#entries.get(entry.data.id) === entry) {
        if (entry.data.value === value) return logicalIndex;
        logicalIndex++;
      }
    }
    return -1;
  }

  findByData(option: OptionValue<Item>): RegisteredOption<Item> | undefined {
    const entry = this.#entries.get(option.id);
    return entry?.data === option ? entry : undefined;
  }

  matching(
    predicate: (option: OptionValue<Item>) => boolean,
  ): RegisteredOption<Item>[] {
    const matches: RegistryEntry<Item>[] = [];
    for (const entry of this.#ordered) {
      if (
        entry !== undefined &&
        this.#entries.get(entry.data.id) === entry &&
        predicate(entry.data)
      ) {
        matches.push(entry);
      }
    }
    return matches;
  }

  snapshot(): readonly RegisteredOption<Item>[] {
    return this.#ordered.filter(
      (entry): entry is RegistryEntry<Item> => entry !== undefined,
    );
  }
}

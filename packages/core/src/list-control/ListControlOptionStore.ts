import type { OptionValue } from "./ListControlContext";

export const OPTION_STATE_ACTIVE = 1;
export const OPTION_STATE_SELECTED = 2;
export const OPTION_STATE_FOCUS_VISIBLE = 4;

export type OptionStateSnapshot = number;

interface OptionEntry<Item> {
  generation: number;
  option: OptionValue<Item>;
}

/** Internal per-list store used to target updates at affected Options. */
export class ListControlOptionStore<Item> {
  readonly #listeners = new Map<string, Set<() => void>>();
  readonly #options = new Map<string, OptionEntry<Item>>();
  readonly #optionIdsByValue = new Map<Item, string | Set<string>>();
  #activeId: string | undefined;
  #focusVisible = false;
  #nextGeneration = 0;
  #selected: ReadonlySet<Item>;

  constructor(selected: readonly Item[] = []) {
    this.#selected = new Set(selected);
  }

  subscribe(id: string, listener: () => void): () => void {
    let listeners = this.#listeners.get(id);
    if (!listeners) {
      listeners = new Set();
      this.#listeners.set(id, listeners);
    }
    listeners.add(listener);

    return () => {
      const currentListeners = this.#listeners.get(id);
      currentListeners?.delete(listener);
      if (currentListeners?.size === 0) {
        this.#listeners.delete(id);
      }
    };
  }

  register(option: OptionValue<Item>): () => void {
    const previousEntry = this.#options.get(option.id);
    const previousSnapshot = this.getSnapshot(option.id);
    if (previousEntry) {
      this.#deleteValueId(previousEntry.option.value, option.id);
    }
    const entry = {
      generation: this.#nextGeneration++,
      option,
    };
    this.#options.set(option.id, entry);
    const valueIds = this.#optionIdsByValue.get(option.value);
    if (valueIds === undefined) {
      this.#optionIdsByValue.set(option.value, option.id);
    } else if (typeof valueIds === "string") {
      this.#optionIdsByValue.set(option.value, new Set([valueIds, option.id]));
    } else {
      valueIds.add(option.id);
    }

    if (
      previousEntry !== undefined ||
      previousSnapshot !== this.getSnapshot(option.id)
    ) {
      this.#notify(option.id);
    }

    return () => {
      const current = this.#options.get(option.id);
      if (current?.generation !== entry.generation) return;
      const previousSnapshot = this.getSnapshot(option.id);
      this.#options.delete(option.id);
      this.#deleteValueId(option.value, option.id);
      if (previousSnapshot !== 0) this.#notify(option.id);
    };
  }

  getSnapshot(
    id: string,
    fallbackOption?: OptionValue<Item>,
  ): OptionStateSnapshot {
    const option = fallbackOption ?? this.#options.get(id)?.option;
    if (!option) return 0;

    let snapshot = 0;
    if (id === this.#activeId) {
      snapshot |= OPTION_STATE_ACTIVE;
      if (this.#focusVisible) snapshot |= OPTION_STATE_FOCUS_VISIBLE;
    }
    if (this.#selected.has(option.value)) {
      snapshot |= OPTION_STATE_SELECTED;
    }
    return snapshot;
  }

  setActiveId(id: string | undefined): void {
    if (id === this.#activeId) return;
    const previousId = this.#activeId;
    this.#activeId = id;
    if (previousId !== undefined) this.#notify(previousId);
    if (id !== undefined) this.#notify(id);
  }

  setFocusVisible(focusVisible: boolean): void {
    if (focusVisible === this.#focusVisible) return;
    this.#focusVisible = focusVisible;
    if (this.#activeId !== undefined) this.#notify(this.#activeId);
  }

  setSelected(selected: readonly Item[]): void {
    const previous = this.#selected;
    const nextSelected = new Set(selected);
    this.#selected = nextSelected;

    const candidateValues = new Set([...previous, ...nextSelected]);
    for (const value of candidateValues) {
      if (previous.has(value) !== nextSelected.has(value)) {
        const ids = this.#optionIdsByValue.get(value);
        if (typeof ids === "string") {
          this.#notify(ids);
        } else if (ids !== undefined) {
          for (const id of ids) this.#notify(id);
        }
      }
    }
  }

  /** Test-only observability without exposing mutable listener state. */
  get listenerEntryCount(): number {
    return this.#listeners.size;
  }

  #notify(id: string): void {
    const listeners = this.#listeners.get(id);
    if (!listeners) return;
    for (const listener of [...listeners]) listener();
  }

  #deleteValueId(value: Item, id: string): void {
    const ids = this.#optionIdsByValue.get(value);
    if (typeof ids === "string") {
      if (ids === id) this.#optionIdsByValue.delete(value);
      return;
    }
    ids?.delete(id);
    if (ids?.size === 1) {
      this.#optionIdsByValue.set(value, ids.values().next().value as string);
    } else if (ids?.size === 0) {
      this.#optionIdsByValue.delete(value);
    }
  }
}

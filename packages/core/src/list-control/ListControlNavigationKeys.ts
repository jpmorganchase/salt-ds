import type { OptionValue } from "./ListControlContext";

/** Keys that always navigate between options and should prevent default. */
export const LIST_CONTROL_NAVIGATION_KEYS: ReadonlySet<string> = new Set([
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

export function isListControlNavigationKey(key: string): boolean {
  return LIST_CONTROL_NAVIGATION_KEYS.has(key);
}

/**
 * Home/End are excluded: in an editable field they should only take over
 * when the active option actually changes, so they're handled separately.
 */
export const LIST_CONTROL_EDITABLE_NAVIGATION_KEYS: ReadonlySet<string> =
  new Set(["ArrowDown", "ArrowUp", "PageUp", "PageDown"]);

export function isListControlEditableNavigationKey(key: string): boolean {
  return LIST_CONTROL_EDITABLE_NAVIGATION_KEYS.has(key);
}

export interface OptionAndElement<Item> {
  data: OptionValue<Item>;
  element: HTMLElement;
}

export interface ListControlNavigationGetters<Item> {
  getFirstOption: () => OptionAndElement<Item> | undefined;
  getLastOption: () => OptionAndElement<Item> | undefined;
  getOptionAfter: (
    option: OptionValue<Item>,
  ) => OptionAndElement<Item> | undefined;
  getOptionBefore: (
    option: OptionValue<Item>,
  ) => OptionAndElement<Item> | undefined;
  getOptionPageAbove: (
    option: OptionValue<Item>,
  ) => OptionAndElement<Item> | undefined;
  getOptionPageBelow: (
    option: OptionValue<Item>,
  ) => OptionAndElement<Item> | undefined;
}

/** Shared by Dropdown and ListBox, which always have an active option. */
export function getListControlNavigationTarget<Item>(
  key: string,
  activeOption: OptionValue<Item>,
  getters: ListControlNavigationGetters<Item>,
): OptionAndElement<Item> | undefined {
  switch (key) {
    case "ArrowDown":
      return getters.getOptionAfter(activeOption) ?? getters.getLastOption();
    case "ArrowUp":
      return getters.getOptionBefore(activeOption) ?? getters.getFirstOption();
    case "Home":
      return getters.getFirstOption();
    case "End":
      return getters.getLastOption();
    case "PageUp":
      return getters.getOptionPageAbove(activeOption);
    case "PageDown":
      return getters.getOptionPageBelow(activeOption);
    default:
      return undefined;
  }
}

/** For ComboBox, where the active option may be undefined. */
export function getComboBoxNavigationTarget<Item>(
  key: string,
  activeOption: OptionValue<Item> | undefined,
  getters: ListControlNavigationGetters<Item>,
): OptionAndElement<Item> | undefined {
  switch (key) {
    case "ArrowDown":
      return activeOption
        ? getters.getOptionAfter(activeOption)
        : getters.getFirstOption();
    case "ArrowUp":
      return activeOption
        ? getters.getOptionBefore(activeOption)
        : getters.getLastOption();
    case "Home":
      return getters.getFirstOption();
    case "End":
      return getters.getLastOption();
    case "PageUp": {
      if (activeOption) {
        return getters.getOptionPageAbove(activeOption);
      }
      const lastOption = getters.getLastOption();
      return lastOption
        ? getters.getOptionPageAbove(lastOption.data)
        : undefined;
    }
    case "PageDown": {
      if (activeOption) {
        return getters.getOptionPageBelow(activeOption);
      }
      const firstOption = getters.getFirstOption();
      return firstOption
        ? getters.getOptionPageBelow(firstOption.data)
        : undefined;
    }
    default:
      return undefined;
  }
}

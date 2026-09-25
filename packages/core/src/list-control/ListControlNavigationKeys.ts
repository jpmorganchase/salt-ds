import type { OptionValue } from "./ListControlContext";

/**
 * Keys that move between options while the list is shown. When no list is
 * shown, Dropdown and ComboBox pass the keys they don't use to open the list
 * to the browser.
 */
const LIST_CONTROL_NAVIGATION_KEYS: ReadonlySet<string> = new Set([
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
 * Navigation keys pressed with Ctrl or Meta (e.g. Ctrl+End, Cmd+ArrowDown,
 * Ctrl+PageDown) are browser or OS shortcuts, so list controls leave them to
 * the browser. Alt is only used with ArrowUp and ArrowDown, as in the ARIA
 * combobox pattern.
 */
export function isModifiedListControlNavigationKey(event: {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}): boolean {
  if (!isListControlNavigationKey(event.key)) {
    return false;
  }
  if (event.ctrlKey || event.metaKey) {
    return true;
  }
  return event.altKey && event.key !== "ArrowUp" && event.key !== "ArrowDown";
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

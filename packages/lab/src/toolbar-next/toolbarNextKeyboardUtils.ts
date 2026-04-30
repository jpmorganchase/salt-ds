import type { ToolbarNextOverflowItem } from "./toolbarNextUtils";

export const TOOLBAR_NEXT_SCOPE_ROOT_ATTR = "data-salt-toolbar-next-scope-root";
export const TOOLBAR_NEXT_ITEM_ATTR = "data-salt-toolbar-next-item-id";
export const TOOLBAR_NEXT_GROUP_KEY_ATTR =
  "data-salt-toolbar-next-overflow-group-key";
export const TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR =
  "data-salt-toolbar-next-overflow-trigger";

const focusableSelector = [
  "button",
  "[href]",
  "input",
  "select",
  "textarea",
  "[tabindex]",
].join(", ");

const textEntryInputTypes = new Set([
  "",
  "date",
  "datetime-local",
  "email",
  "month",
  "number",
  "password",
  "search",
  "tel",
  "text",
  "time",
  "url",
  "week",
]);

export type ToolbarNextFocusMemory =
  | {
      controlIndex: number;
      itemId: string;
      scopeIndex: number;
      type: "item";
    }
  | {
      groupKey: string;
      scopeIndex: number;
      type: "overflow-trigger";
    }
  | {
      scopeIndex: number;
      type: "scope";
    };

interface ToolbarNextFocusableOptions {
  includeTabIndexMinusOne?: boolean;
}

export function getClosestToolbarNextScopeRoot(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLElement>(`[${TOOLBAR_NEXT_SCOPE_ROOT_ATTR}]`);
}

export function getToolbarNextScopeFocusableElements(
  scopeRoot: HTMLElement,
  options: ToolbarNextFocusableOptions = {},
) {
  return Array.from(
    scopeRoot.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => {
    return (
      getClosestToolbarNextScopeRoot(element) === scopeRoot &&
      isToolbarNextFocusable(element, options)
    );
  });
}

export function getToolbarNextFocusMemory(
  scopeRoot: HTMLElement,
  target: HTMLElement,
  options: ToolbarNextFocusableOptions = {},
): ToolbarNextFocusMemory | null {
  const scopeElements = getToolbarNextScopeFocusableElements(
    scopeRoot,
    options,
  );
  const scopeIndex = scopeElements.indexOf(target);
  if (scopeIndex === -1) {
    return null;
  }

  const groupTrigger = target.closest<HTMLElement>(
    `[${TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR}]`,
  );
  const groupKey = groupTrigger?.getAttribute(TOOLBAR_NEXT_GROUP_KEY_ATTR);

  if (groupKey) {
    return {
      groupKey,
      scopeIndex,
      type: "overflow-trigger",
    };
  }

  const itemRoot = target.closest<HTMLElement>(`[${TOOLBAR_NEXT_ITEM_ATTR}]`);
  const itemId = itemRoot?.getAttribute(TOOLBAR_NEXT_ITEM_ATTR);

  if (itemRoot && itemId) {
    const itemElements = getToolbarNextItemFocusableElements(
      itemRoot,
      scopeRoot,
      options,
    );
    const controlIndex = itemElements.indexOf(target);

    return {
      controlIndex: Math.max(controlIndex, 0),
      itemId,
      scopeIndex,
      type: "item",
    };
  }

  return {
    scopeIndex,
    type: "scope",
  };
}

export function resolveToolbarNextFocusTarget(
  scopeRoot: HTMLElement,
  focusMemory: ToolbarNextFocusMemory | null,
  {
    includeTabIndexMinusOne,
    items = [],
    overflowedIds,
  }: {
    items?: ToolbarNextOverflowItem[];
    includeTabIndexMinusOne?: boolean;
    overflowedIds?: Set<string>;
  } = {},
) {
  const focusableOptions = {
    includeTabIndexMinusOne,
  };

  if (!focusMemory) {
    return (
      getToolbarNextScopeFocusableElements(scopeRoot, focusableOptions)[0] ??
      null
    );
  }

  const fallback = getToolbarNextFocusFallback(
    scopeRoot,
    focusMemory.scopeIndex,
    focusableOptions,
  );

  if (focusMemory.type === "overflow-trigger") {
    const trigger = getToolbarNextOverflowTriggerElement(
      scopeRoot,
      focusMemory.groupKey,
    );

    if (trigger) {
      return trigger;
    }

    const firstVisibleItem = items.find((item) => {
      return item.overflowGroupKey === focusMemory.groupKey;
    });

    if (firstVisibleItem) {
      return (
        getToolbarNextFocusableElementForItem(
          scopeRoot,
          firstVisibleItem.id,
          0,
          focusableOptions,
        ) ?? fallback
      );
    }

    return fallback;
  }

  if (focusMemory.type === "item") {
    const visibleItemTarget = getToolbarNextFocusableElementForItem(
      scopeRoot,
      focusMemory.itemId,
      focusMemory.controlIndex,
      focusableOptions,
    );

    if (visibleItemTarget) {
      return visibleItemTarget;
    }

    const item = items.find((entry) => entry.id === focusMemory.itemId);

    if (item && overflowedIds?.has(item.id)) {
      return (
        getToolbarNextOverflowTriggerElement(
          scopeRoot,
          item.overflowGroupKey,
        ) ?? fallback
      );
    }

    return fallback;
  }

  return fallback;
}

export function getToolbarNextDirectionalMoveTarget(
  scopeRoot: HTMLElement,
  target: HTMLElement,
  key: string,
  options: ToolbarNextFocusableOptions = {},
) {
  if (key !== "ArrowLeft" && key !== "ArrowRight") {
    return null;
  }

  if (target.isContentEditable) {
    return null;
  }

  if (isPlainTextInput(target)) {
    return null;
  }

  if (!isComboBoxInput(target)) {
    const toggleGroupButtons = getToggleGroupButtons(target);

    if (toggleGroupButtons.length > 0) {
      const visualDelta = getVisualDelta(scopeRoot, key);
      const currentIndex = toggleGroupButtons.indexOf(target);

      if (
        currentIndex === -1 ||
        !isToggleGroupBoundary(
          currentIndex,
          toggleGroupButtons.length,
          visualDelta,
        )
      ) {
        return null;
      }
    }
  }

  const scopeElements = getToolbarNextScopeFocusableElements(
    scopeRoot,
    options,
  );
  const currentIndex = scopeElements.indexOf(target);

  if (currentIndex === -1 || scopeElements.length <= 1) {
    return null;
  }

  const nextIndex =
    (currentIndex + getVisualDelta(scopeRoot, key) + scopeElements.length) %
    scopeElements.length;

  return scopeElements[nextIndex] ?? null;
}

export function getToolbarNextTabMoveTarget(
  scopeRoot: HTMLElement,
  shiftKey: boolean,
) {
  const focusableElements = getDocumentFocusableElements(
    scopeRoot.ownerDocument,
  );

  if (shiftKey) {
    for (let index = focusableElements.length - 1; index >= 0; index -= 1) {
      const element = focusableElements[index];

      if (!element || scopeRoot.contains(element)) {
        continue;
      }

      if (
        element.compareDocumentPosition(scopeRoot) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        return element;
      }
    }

    return null;
  }

  return (
    focusableElements.find((element) => {
      return (
        !scopeRoot.contains(element) &&
        !!(
          scopeRoot.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_FOLLOWING
        )
      );
    }) ?? null
  );
}

export function shouldToolbarNextPreserveNativeTab(target: HTMLElement) {
  return (
    target.isContentEditable ||
    isPlainTextInput(target) ||
    isSelectLikeControl(target) ||
    target.closest(".saltToggleButtonGroup") != null ||
    target.closest(".saltDatePickerTrigger") != null
  );
}

function getToolbarNextItemFocusableElements(
  itemRoot: HTMLElement,
  scopeRoot: HTMLElement,
  options: ToolbarNextFocusableOptions = {},
) {
  return Array.from(
    itemRoot.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => {
    return (
      getClosestToolbarNextScopeRoot(element) === scopeRoot &&
      isToolbarNextFocusable(element, options)
    );
  });
}

function getToolbarNextFocusableElementForItem(
  scopeRoot: HTMLElement,
  itemId: string,
  controlIndex: number,
  options: ToolbarNextFocusableOptions = {},
) {
  const itemRoot = scopeRoot.querySelector<HTMLElement>(
    `[${TOOLBAR_NEXT_ITEM_ATTR}="${itemId}"]`,
  );

  if (!itemRoot) {
    return null;
  }

  const itemElements = getToolbarNextItemFocusableElements(
    itemRoot,
    scopeRoot,
    options,
  );

  return (
    itemElements[Math.min(controlIndex, itemElements.length - 1)] ??
    itemElements[0] ??
    null
  );
}

function getToolbarNextOverflowTriggerElement(
  scopeRoot: HTMLElement,
  groupKey: string,
) {
  return scopeRoot.querySelector<HTMLElement>(
    `[${TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR}][${TOOLBAR_NEXT_GROUP_KEY_ATTR}="${groupKey}"]`,
  );
}

function getToolbarNextFocusFallback(
  scopeRoot: HTMLElement,
  rememberedIndex: number,
  options: ToolbarNextFocusableOptions = {},
) {
  const focusableElements = getToolbarNextScopeFocusableElements(
    scopeRoot,
    options,
  );

  if (focusableElements.length === 0) {
    return null;
  }

  return (
    focusableElements[
      Math.max(0, Math.min(rememberedIndex, focusableElements.length - 1))
    ] ?? focusableElements[0]
  );
}

function getVisualDelta(scopeRoot: HTMLElement, key: string) {
  const direction =
    scopeRoot.ownerDocument.defaultView?.getComputedStyle(scopeRoot).direction;

  if (key === "ArrowRight") {
    return direction === "rtl" ? -1 : 1;
  }

  return direction === "rtl" ? 1 : -1;
}

function isToggleGroupBoundary(
  currentIndex: number,
  length: number,
  visualDelta: number,
) {
  if (visualDelta > 0) {
    return currentIndex === length - 1;
  }

  return currentIndex === 0;
}

function getToggleGroupButtons(target: HTMLElement) {
  const toggleGroup = target.closest<HTMLElement>(".saltToggleButtonGroup");

  if (!toggleGroup || target.tagName !== "BUTTON") {
    return [];
  }

  return Array.from(
    toggleGroup.querySelectorAll<HTMLElement>("button:not([disabled])"),
  ).filter((button) => isToolbarNextFocusable(button));
}

function isComboBoxInput(target: HTMLElement) {
  return (
    target.tagName === "INPUT" &&
    target.closest('[role="combobox"], .saltComboBox') != null
  );
}

function isSelectLikeControl(target: HTMLElement) {
  return (
    target.tagName === "SELECT" ||
    target.closest('[role="combobox"], .saltComboBox, .saltDropdown') != null
  );
}

function isPlainTextInput(target: HTMLElement) {
  if (target.tagName === "TEXTAREA") {
    return true;
  }

  if (target.tagName !== "INPUT") {
    return false;
  }

  if (isComboBoxInput(target)) {
    return false;
  }

  return textEntryInputTypes.has(
    (target as HTMLInputElement).type.toLowerCase(),
  );
}

function isToolbarNextFocusable(
  target: HTMLElement,
  { includeTabIndexMinusOne = false }: ToolbarNextFocusableOptions = {},
) {
  if (target.matches(":disabled")) {
    return false;
  }

  if (target.getAttribute("aria-hidden") === "true") {
    return false;
  }

  if (!includeTabIndexMinusOne && target.getAttribute("tabindex") === "-1") {
    return false;
  }

  if (target.hidden) {
    return false;
  }

  const win = target.ownerDocument.defaultView;

  if (!win) {
    return false;
  }

  const styles = win.getComputedStyle(target);

  if (styles.display === "none" || styles.visibility === "hidden") {
    return false;
  }

  return target.getClientRects().length > 0;
}

function getDocumentFocusableElements(ownerDocument: Document) {
  return Array.from(
    ownerDocument.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((element) => isToolbarNextFocusable(element));
}

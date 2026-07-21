import type { ToolbarOverflowItem } from "./toolbarUtils";

export const TOOLBAR_SCOPE_ROOT_ATTR = "data-salt-toolbar-scope-root";
export const TOOLBAR_ITEM_ATTR = "data-salt-toolbar-item-id";
export const TOOLBAR_GROUP_KEY_ATTR = "data-salt-toolbar-overflow-group-key";
export const TOOLBAR_OVERFLOW_TRIGGER_ATTR =
  "data-salt-toolbar-overflow-trigger";

export const toolbarFocusableSelector = [
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

export type ToolbarFocusMemory =
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

export interface ToolbarFocusableOptions {
  includeTabIndexMinusOne?: boolean;
}

interface ToolbarKeyboardPolicy {
  preserveHorizontalArrows: boolean;
  preserveNativeTab: boolean;
}

export function getClosestToolbarScopeRoot(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLElement>(`[${TOOLBAR_SCOPE_ROOT_ATTR}]`);
}

export function getToolbarItemId(target: Element | null) {
  return (
    target
      ?.closest<HTMLElement>(`[${TOOLBAR_ITEM_ATTR}]`)
      ?.getAttribute(TOOLBAR_ITEM_ATTR) ?? null
  );
}

export function isToolbarFocusFromPointerTarget(
  focusTarget: HTMLElement,
  pointerTarget: EventTarget | null,
) {
  if (!(pointerTarget instanceof Node)) {
    return false;
  }

  if (focusTarget === pointerTarget || focusTarget.contains(pointerTarget)) {
    return true;
  }

  if (!(pointerTarget instanceof Element)) {
    return false;
  }

  const focusItemId = getToolbarItemId(focusTarget);
  const pointerItemId = getToolbarItemId(pointerTarget);

  return focusItemId != null && focusItemId === pointerItemId;
}

export function getToolbarScopeFocusableElements(
  scopeRoot: HTMLElement,
  options: ToolbarFocusableOptions = {},
) {
  return Array.from(
    scopeRoot.querySelectorAll<HTMLElement>(toolbarFocusableSelector),
  ).filter((element) => {
    return (
      getClosestToolbarScopeRoot(element) === scopeRoot &&
      (isToolbarFocusable(element, options) ||
        isToolbarToggleGroupButton(element))
    );
  });
}

export function getToolbarFocusMemory(
  scopeRoot: HTMLElement,
  target: HTMLElement,
  options: ToolbarFocusableOptions = {},
): ToolbarFocusMemory | null {
  const scopeElements = getToolbarScopeFocusableElements(scopeRoot, options);
  const scopeIndex = scopeElements.indexOf(target);
  if (scopeIndex === -1) {
    return null;
  }

  const groupTrigger = target.closest<HTMLElement>(
    `[${TOOLBAR_OVERFLOW_TRIGGER_ATTR}]`,
  );
  const groupKey = groupTrigger?.getAttribute(TOOLBAR_GROUP_KEY_ATTR);

  if (groupKey) {
    return {
      groupKey,
      scopeIndex,
      type: "overflow-trigger",
    };
  }

  const itemRoot = target.closest<HTMLElement>(`[${TOOLBAR_ITEM_ATTR}]`);
  const itemId = itemRoot?.getAttribute(TOOLBAR_ITEM_ATTR);

  if (itemRoot && itemId) {
    const itemElements = getToolbarItemFocusableElements(
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

export function resolveToolbarFocusTarget(
  scopeRoot: HTMLElement,
  focusMemory: ToolbarFocusMemory | null,
  {
    includeTabIndexMinusOne,
    items = [],
    overflowedIds,
  }: {
    items?: ToolbarOverflowItem[];
    includeTabIndexMinusOne?: boolean;
    overflowedIds?: Set<string>;
  } = {},
) {
  const focusableOptions = {
    includeTabIndexMinusOne,
  };

  if (!focusMemory) {
    return (
      getToolbarScopeFocusableElements(scopeRoot, focusableOptions)[0] ?? null
    );
  }

  const fallback = getToolbarFocusFallback(
    scopeRoot,
    focusMemory.scopeIndex,
    focusableOptions,
  );

  if (focusMemory.type === "overflow-trigger") {
    const trigger = getToolbarOverflowTriggerElement(
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
        getToolbarFocusableElementForItem(
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
    const visibleItemTarget = getToolbarFocusableElementForItem(
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
        getToolbarOverflowTriggerElement(scopeRoot, item.overflowGroupKey) ??
        fallback
      );
    }

    return fallback;
  }

  return fallback;
}

export function getToolbarDirectionalMoveTarget(
  scopeRoot: HTMLElement,
  target: HTMLElement,
  key: string,
  options: ToolbarFocusableOptions = {},
) {
  if (key !== "ArrowLeft" && key !== "ArrowRight") {
    return null;
  }

  if (getToolbarKeyboardPolicy(target).preserveHorizontalArrows) {
    return null;
  }

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

  const scopeElements = getToolbarScopeFocusableElements(scopeRoot, options);
  const currentIndex = scopeElements.indexOf(target);

  if (currentIndex === -1 || scopeElements.length <= 1) {
    return null;
  }

  const nextIndex =
    (currentIndex + getVisualDelta(scopeRoot, key) + scopeElements.length) %
    scopeElements.length;

  return scopeElements[nextIndex] ?? null;
}

export function getToolbarTabMoveTarget(
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

export function shouldToolbarPreserveNativeTab(target: HTMLElement) {
  return getToolbarKeyboardPolicy(target).preserveNativeTab;
}

function getToolbarItemFocusableElements(
  itemRoot: HTMLElement,
  scopeRoot: HTMLElement,
  options: ToolbarFocusableOptions = {},
) {
  return Array.from(
    itemRoot.querySelectorAll<HTMLElement>(toolbarFocusableSelector),
  ).filter((element) => {
    return (
      getClosestToolbarScopeRoot(element) === scopeRoot &&
      (isToolbarFocusable(element, options) ||
        isToolbarToggleGroupButton(element))
    );
  });
}

function getToolbarFocusableElementForItem(
  scopeRoot: HTMLElement,
  itemId: string,
  controlIndex: number,
  options: ToolbarFocusableOptions = {},
) {
  const itemRoot = scopeRoot.querySelector<HTMLElement>(
    `[${TOOLBAR_ITEM_ATTR}="${itemId}"]`,
  );

  if (!itemRoot) {
    return null;
  }

  const itemElements = getToolbarItemFocusableElements(
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

function getToolbarOverflowTriggerElement(
  scopeRoot: HTMLElement,
  groupKey: string,
) {
  return scopeRoot.querySelector<HTMLElement>(
    `[${TOOLBAR_OVERFLOW_TRIGGER_ATTR}][${TOOLBAR_GROUP_KEY_ATTR}="${groupKey}"]`,
  );
}

function getToolbarFocusFallback(
  scopeRoot: HTMLElement,
  rememberedIndex: number,
  options: ToolbarFocusableOptions = {},
) {
  const focusableElements = getToolbarScopeFocusableElements(
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

  return Array.from(toggleGroup.querySelectorAll<HTMLElement>("button")).filter(
    (button) => isToolbarFocusable(button, { includeTabIndexMinusOne: true }),
  );
}

function isToolbarToggleGroupButton(target: HTMLElement) {
  return (
    target.tagName === "BUTTON" &&
    target.closest(".saltToggleButtonGroup") != null &&
    isToolbarFocusable(target, { includeTabIndexMinusOne: true })
  );
}

function getToolbarKeyboardPolicy(target: HTMLElement): ToolbarKeyboardPolicy {
  if (
    target.isContentEditable ||
    isPlainTextInput(target) ||
    isComboBoxInput(target) ||
    isPillInputPill(target)
  ) {
    return {
      preserveHorizontalArrows: true,
      preserveNativeTab: true,
    };
  }

  if (isDropdownControl(target)) {
    return {
      preserveHorizontalArrows: false,
      preserveNativeTab: false,
    };
  }

  if (
    isSelectLikeControl(target) ||
    target.closest(".saltDatePickerTrigger") != null
  ) {
    return {
      preserveHorizontalArrows: false,
      preserveNativeTab: true,
    };
  }

  return {
    preserveHorizontalArrows: false,
    preserveNativeTab: false,
  };
}

function isComboBoxInput(target: HTMLElement) {
  return (
    target.tagName === "INPUT" &&
    target.closest('[role="combobox"], .saltComboBox') != null
  );
}

function isPillInputPill(target: HTMLElement) {
  return (
    target.tagName === "BUTTON" &&
    target.classList.contains("saltPill") &&
    target.closest(".saltPillInput") != null
  );
}

function isDropdownControl(target: HTMLElement) {
  return target.closest(".saltDropdown") != null;
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

  return textEntryInputTypes.has(
    (target as HTMLInputElement).type.toLowerCase(),
  );
}

function isNativeDisabledFormControl(target: HTMLElement) {
  return (
    "disabled" in target &&
    (target as HTMLButtonElement | HTMLInputElement).disabled
  );
}

export function isToolbarFocusable(
  target: HTMLElement,
  { includeTabIndexMinusOne = false }: ToolbarFocusableOptions = {},
) {
  if (isNativeDisabledFormControl(target)) {
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

// Composite controls whose focus root (the element toolbar focus restore lands
// on) differs from the inner element that handles keyboard interaction.
// Restoring focus to the root would leave ArrowDown/Enter/Space targeting a
// non-interactive wrapper, so we redirect to the interactive element
const toolbarFocusEntryOverrides = [
  { root: ".saltComboBox", interactive: 'input[role="combobox"]' },
] as const;

export function focusToolbarElement(target: HTMLElement | null | undefined) {
  const focusTarget = resolveToolbarFocusEntryTarget(target);

  if (focusTarget?.isConnected) {
    focusTarget.focus({ preventScroll: true });
  }
}

function resolveToolbarFocusEntryTarget(
  target: HTMLElement | null | undefined,
) {
  if (!target) {
    return target;
  }

  for (const { root, interactive } of toolbarFocusEntryOverrides) {
    if (target.matches(root)) {
      return target.querySelector<HTMLElement>(interactive) ?? target;
    }
  }

  return target;
}

export function scheduleToolbarFocus(
  target: HTMLElement | null | undefined,
  targetWindow = target?.ownerDocument.defaultView,
) {
  if (!target) {
    return () => undefined;
  }

  if (targetWindow?.requestAnimationFrame) {
    const frame = targetWindow.requestAnimationFrame(() => {
      focusToolbarElement(target);
    });

    return () => {
      targetWindow.cancelAnimationFrame(frame);
    };
  }

  queueMicrotask(() => {
    focusToolbarElement(target);
  });

  return () => undefined;
}

export function getDocumentFocusableElements(ownerDocument: Document) {
  return Array.from(
    ownerDocument.querySelectorAll<HTMLElement>(toolbarFocusableSelector),
  ).filter((element) => isToolbarFocusable(element));
}

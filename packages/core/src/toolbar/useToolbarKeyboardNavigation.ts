import {
  type FocusEventHandler,
  type KeyboardEventHandler,
  type PointerEventHandler,
  type RefObject,
  useCallback,
  useRef,
} from "react";
import {
  focusToolbarElement,
  getClosestToolbarScopeRoot,
  getToolbarDirectionalMoveTarget,
  getToolbarFocusMemory,
  getToolbarScopeFocusableElements,
  getToolbarTabMoveTarget,
  isToolbarFocusFromPointerTarget,
  resolveToolbarFocusTarget,
  shouldToolbarPreserveNativeTab,
  TOOLBAR_GROUP_KEY_ATTR,
  TOOLBAR_ITEM_ATTR,
  TOOLBAR_OVERFLOW_TRIGGER_ATTR,
  TOOLBAR_SCOPE_ROOT_ATTR,
  type ToolbarFocusMemory,
} from "./toolbarKeyboardUtils";
import type { ToolbarOverflowItem } from "./toolbarUtils";

interface UseToolbarKeyboardNavigationProps {
  includeTabIndexMinusOne?: boolean;
  items?: ToolbarOverflowItem[];
  overflowedIds?: Set<string>;
  scopeRef: RefObject<HTMLElement | null>;
}

interface ToolbarFocusEvent {
  relatedTarget: EventTarget | null;
  stopPropagation: () => void;
  target: EventTarget | null;
}

interface ToolbarKeyDownEvent {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  preventDefault: () => void;
  shiftKey: boolean;
  stopPropagation: () => void;
  target: EventTarget | null;
}

interface ToolbarPointerEvent {
  target: EventTarget | null;
}

export function useToolbarKeyboardNavigation({
  includeTabIndexMinusOne = false,
  items = [],
  overflowedIds,
  scopeRef,
}: UseToolbarKeyboardNavigationProps) {
  const rememberedFocusRef = useRef<ToolbarFocusMemory | null>(null);
  const pointerDownTargetRef = useRef<EventTarget | null>(null);
  const restoringEntryFocusRef = useRef(false);

  const shouldPreserveItemMemoryForTrigger = useCallback(
    (groupKey: string) => {
      const rememberedFocus = rememberedFocusRef.current;

      if (rememberedFocus?.type !== "item") {
        return false;
      }

      const item = items.find((entry) => entry.id === rememberedFocus.itemId);

      return (
        item?.overflowGroupKey === groupKey &&
        (overflowedIds == null || overflowedIds.has(item.id))
      );
    },
    [items, overflowedIds],
  );

  const rememberTarget = useCallback(
    (target: HTMLElement) => {
      const scopeRoot = scopeRef.current;

      if (!scopeRoot) {
        return;
      }

      const focusMemory = getToolbarFocusMemory(scopeRoot, target, {
        includeTabIndexMinusOne,
      });

      if (focusMemory) {
        if (
          focusMemory.type === "overflow-trigger" &&
          shouldPreserveItemMemoryForTrigger(focusMemory.groupKey)
        ) {
          return;
        }

        rememberedFocusRef.current = focusMemory;
      }
    },
    [includeTabIndexMinusOne, scopeRef, shouldPreserveItemMemoryForTrigger],
  );

  const rememberItemFocus = useCallback(
    (itemId: string, controlIndex: number) => {
      const scopeRoot = scopeRef.current;

      if (!scopeRoot) {
        return;
      }

      const focusables = getToolbarScopeFocusableElements(scopeRoot, {
        includeTabIndexMinusOne,
      });
      const itemFocusables = focusables.filter((element) => {
        return (
          element
            .closest<HTMLElement>(`[${TOOLBAR_ITEM_ATTR}]`)
            ?.getAttribute(TOOLBAR_ITEM_ATTR) === itemId
        );
      });
      const item = items.find((entry) => entry.id === itemId);
      const visibleItemTarget =
        itemFocusables[Math.min(controlIndex, itemFocusables.length - 1)] ??
        itemFocusables[0];
      const overflowTriggerTarget = item
        ? focusables.find((element) => {
            const trigger = element.closest<HTMLElement>(
              `[${TOOLBAR_OVERFLOW_TRIGGER_ATTR}]`,
            );

            return (
              trigger?.getAttribute(TOOLBAR_GROUP_KEY_ATTR) ===
              item.overflowGroupKey
            );
          })
        : undefined;
      const scopeIndex = Math.max(
        focusables.indexOf(visibleItemTarget ?? overflowTriggerTarget),
        rememberedFocusRef.current?.scopeIndex ?? 0,
      );
      const focusMemory: ToolbarFocusMemory = {
        controlIndex,
        itemId,
        scopeIndex,
        type: "item",
      };

      rememberedFocusRef.current = focusMemory;
    },
    [includeTabIndexMinusOne, items, scopeRef],
  );

  const focusEntryTarget = useCallback(() => {
    const scopeRoot = scopeRef.current;

    if (!scopeRoot) {
      return;
    }

    const target = resolveToolbarFocusTarget(
      scopeRoot,
      rememberedFocusRef.current,
      {
        items,
        includeTabIndexMinusOne,
        overflowedIds,
      },
    );

    if (!target) {
      return;
    }

    queueMicrotask(() => {
      focusToolbarElement(target);
    });
  }, [includeTabIndexMinusOne, items, overflowedIds, scopeRef]);

  const restoreEntryFocus = useCallback((target: HTMLElement) => {
    restoringEntryFocusRef.current = true;
    focusToolbarElement(target);
  }, []);

  const handleScopeFocus = useCallback(
    (event: ToolbarFocusEvent) => {
      const scopeRoot = scopeRef.current;
      const target = event.target;

      if (
        !scopeRoot ||
        !(target instanceof HTMLElement) ||
        getClosestToolbarScopeRoot(target) !== scopeRoot
      ) {
        return;
      }

      if (restoringEntryFocusRef.current) {
        restoringEntryFocusRef.current = false;
        pointerDownTargetRef.current = null;
        rememberTarget(target);
        return;
      }

      const relatedTarget = event.relatedTarget;
      const enteringFromOutside =
        !(relatedTarget instanceof HTMLElement) ||
        getClosestToolbarScopeRoot(relatedTarget) !== scopeRoot;

      if (!enteringFromOutside) {
        pointerDownTargetRef.current = null;
        rememberTarget(target);
        return;
      }

      const targetMemory = getToolbarFocusMemory(scopeRoot, target, {
        includeTabIndexMinusOne,
      });
      const pointerDownTarget = pointerDownTargetRef.current;
      pointerDownTargetRef.current = null;
      const focusFromPointerTarget = isToolbarFocusFromPointerTarget(
        target,
        pointerDownTarget,
      );

      if (focusFromPointerTarget) {
        rememberTarget(target);
        return;
      }

      if (targetMemory?.type === "overflow-trigger") {
        const shouldPreserve = shouldPreserveItemMemoryForTrigger(
          targetMemory.groupKey,
        );
        if (shouldPreserve) {
          return;
        }

        if (rememberedFocusRef.current?.type === "item") {
          const restoreTarget = resolveToolbarFocusTarget(
            scopeRoot,
            rememberedFocusRef.current,
            {
              items,
              includeTabIndexMinusOne,
              overflowedIds,
            },
          );

          if (restoreTarget && restoreTarget !== target) {
            event.stopPropagation();
            restoreEntryFocus(restoreTarget);
            return;
          }
        }

        rememberedFocusRef.current = targetMemory;
        return;
      }

      const restoreTarget = resolveToolbarFocusTarget(
        scopeRoot,
        rememberedFocusRef.current,
        {
          items,
          includeTabIndexMinusOne,
          overflowedIds,
        },
      );

      if (restoreTarget && restoreTarget !== target) {
        event.stopPropagation();
        restoreEntryFocus(restoreTarget);
        return;
      }

      rememberTarget(target);
    },
    [
      includeTabIndexMinusOne,
      items,
      overflowedIds,
      rememberTarget,
      restoreEntryFocus,
      scopeRef,
      shouldPreserveItemMemoryForTrigger,
    ],
  );

  const handleFocusCapture = useCallback<FocusEventHandler<HTMLElement>>(
    (event) => {
      handleScopeFocus(event);
    },
    [handleScopeFocus],
  );

  const handleScopePointerDown = useCallback(
    (event: ToolbarPointerEvent) => {
      const scopeRoot = scopeRef.current;
      const target = event.target;

      if (
        !scopeRoot ||
        !(target instanceof Element) ||
        getClosestToolbarScopeRoot(target) !== scopeRoot
      ) {
        pointerDownTargetRef.current = null;
        return;
      }

      pointerDownTargetRef.current = target;
    },
    [scopeRef],
  );

  const handlePointerDownCapture = useCallback<
    PointerEventHandler<HTMLElement>
  >(
    (event) => {
      handleScopePointerDown(event);
    },
    [handleScopePointerDown],
  );

  const handleScopeBlur = useCallback(
    (event: ToolbarFocusEvent) => {
      const scopeRoot = scopeRef.current;
      const target = event.target;

      if (
        !scopeRoot ||
        !(target instanceof HTMLElement) ||
        getClosestToolbarScopeRoot(target) !== scopeRoot
      ) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      const leavingScope =
        !(relatedTarget instanceof HTMLElement) ||
        getClosestToolbarScopeRoot(relatedTarget) !== scopeRoot;

      if (leavingScope) {
        rememberTarget(target);
      }
    },
    [rememberTarget, scopeRef],
  );

  const handleBlurCapture = useCallback<FocusEventHandler<HTMLElement>>(
    (event) => {
      handleScopeBlur(event);
    },
    [handleScopeBlur],
  );

  const handleScopeKeyDown = useCallback(
    (event: ToolbarKeyDownEvent) => {
      const scopeRoot = scopeRef.current;
      const target = event.target;

      if (
        !scopeRoot ||
        !(target instanceof HTMLElement) ||
        getClosestToolbarScopeRoot(target) !== scopeRoot ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (
        event.key === "Tab" &&
        scopeRoot.getAttribute(TOOLBAR_SCOPE_ROOT_ATTR) === "main" &&
        !shouldToolbarPreserveNativeTab(target)
      ) {
        const moveTarget = getToolbarTabMoveTarget(scopeRoot, event.shiftKey);

        event.preventDefault();
        event.stopPropagation();

        rememberTarget(target);
        queueMicrotask(() => {
          if (moveTarget?.isConnected) {
            focusToolbarElement(moveTarget);
          } else {
            target.blur();
          }
        });
        return;
      }

      const moveTarget = getToolbarDirectionalMoveTarget(
        scopeRoot,
        target,
        event.key,
        { includeTabIndexMinusOne },
      );

      if (!moveTarget) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      rememberTarget(moveTarget);
      focusToolbarElement(moveTarget);
    },
    [includeTabIndexMinusOne, rememberTarget, scopeRef],
  );

  const handleKeyDownCapture = useCallback<KeyboardEventHandler<HTMLElement>>(
    (event) => {
      handleScopeKeyDown(event);
    },
    [handleScopeKeyDown],
  );

  const getEntryFocusable = useCallback(() => {
    const scopeRoot = scopeRef.current;

    if (!scopeRoot) {
      return null;
    }

    return (
      resolveToolbarFocusTarget(scopeRoot, rememberedFocusRef.current, {
        items,
        includeTabIndexMinusOne,
        overflowedIds,
      }) ??
      getToolbarScopeFocusableElements(scopeRoot, {
        includeTabIndexMinusOne,
      })[0] ??
      null
    );
  }, [includeTabIndexMinusOne, items, overflowedIds, scopeRef]);

  return {
    focusEntryTarget,
    getEntryFocusable,
    handleBlurCapture,
    handleFocusCapture,
    handleKeyDownCapture,
    handlePointerDownCapture,
    handleScopeBlur,
    handleScopeFocus,
    handleScopeKeyDown,
    handleScopePointerDown,
    rememberItemFocus,
    rememberedFocusRef,
  };
}

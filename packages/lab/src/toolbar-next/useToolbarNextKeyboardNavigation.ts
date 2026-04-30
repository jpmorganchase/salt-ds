import {
  type FocusEventHandler,
  type KeyboardEventHandler,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  focusToolbarNextElement,
  getClosestToolbarNextScopeRoot,
  getToolbarNextDirectionalMoveTarget,
  getToolbarNextFocusMemory,
  getToolbarNextScopeFocusableElements,
  getToolbarNextTabMoveTarget,
  resolveToolbarNextFocusTarget,
  shouldToolbarNextPreserveNativeTab,
  TOOLBAR_NEXT_GROUP_KEY_ATTR,
  TOOLBAR_NEXT_ITEM_ATTR,
  TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR,
  TOOLBAR_NEXT_SCOPE_ROOT_ATTR,
  type ToolbarNextFocusMemory,
} from "./toolbarNextKeyboardUtils";
import type { ToolbarNextOverflowItem } from "./toolbarNextUtils";

interface UseToolbarNextKeyboardNavigationProps {
  includeTabIndexMinusOne?: boolean;
  items?: ToolbarNextOverflowItem[];
  overflowedIds?: Set<string>;
  scopeRef: RefObject<HTMLElement | null>;
}

interface ToolbarNextFocusEvent {
  relatedTarget: EventTarget | null;
  target: EventTarget | null;
}

interface ToolbarNextKeyDownEvent {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  preventDefault: () => void;
  shiftKey: boolean;
  stopPropagation: () => void;
  target: EventTarget | null;
}

export function useToolbarNextKeyboardNavigation({
  includeTabIndexMinusOne = false,
  items = [],
  overflowedIds,
  scopeRef,
}: UseToolbarNextKeyboardNavigationProps) {
  const rememberedFocusRef = useRef<ToolbarNextFocusMemory | null>(null);
  const restoringEntryFocusRef = useRef(false);
  const restoreFrameRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      const frame = restoreFrameRef.current;
      const win = scopeRef.current?.ownerDocument.defaultView;

      if (frame != null && win) {
        win.cancelAnimationFrame(frame);
      }
    };
  }, [scopeRef]);

  const rememberTarget = useCallback(
    (target: HTMLElement) => {
      const scopeRoot = scopeRef.current;

      if (!scopeRoot) {
        return;
      }

      const focusMemory = getToolbarNextFocusMemory(scopeRoot, target, {
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

      const focusables = getToolbarNextScopeFocusableElements(scopeRoot, {
        includeTabIndexMinusOne,
      });
      const itemFocusables = focusables.filter((element) => {
        return (
          element
            .closest<HTMLElement>(`[${TOOLBAR_NEXT_ITEM_ATTR}]`)
            ?.getAttribute(TOOLBAR_NEXT_ITEM_ATTR) === itemId
        );
      });
      const item = items.find((entry) => entry.id === itemId);
      const visibleItemTarget =
        itemFocusables[Math.min(controlIndex, itemFocusables.length - 1)] ??
        itemFocusables[0];
      const overflowTriggerTarget = item
        ? focusables.find((element) => {
            const trigger = element.closest<HTMLElement>(
              `[${TOOLBAR_NEXT_OVERFLOW_TRIGGER_ATTR}]`,
            );

            return (
              trigger?.getAttribute(TOOLBAR_NEXT_GROUP_KEY_ATTR) ===
              item.overflowGroupKey
            );
          })
        : undefined;
      const scopeIndex = Math.max(
        focusables.indexOf(visibleItemTarget ?? overflowTriggerTarget),
        rememberedFocusRef.current?.scopeIndex ?? 0,
      );
      const focusMemory: ToolbarNextFocusMemory = {
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

    const target = resolveToolbarNextFocusTarget(
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
      focusToolbarNextElement(target);
    });
  }, [includeTabIndexMinusOne, items, overflowedIds, scopeRef]);

  const handleScopeFocus = useCallback(
    (event: ToolbarNextFocusEvent) => {
      const scopeRoot = scopeRef.current;
      const target = event.target;

      if (
        !scopeRoot ||
        !(target instanceof HTMLElement) ||
        getClosestToolbarNextScopeRoot(target) !== scopeRoot
      ) {
        return;
      }

      if (restoringEntryFocusRef.current) {
        restoringEntryFocusRef.current = false;
        rememberTarget(target);
        return;
      }

      const relatedTarget = event.relatedTarget;
      const enteringFromOutside =
        !(relatedTarget instanceof HTMLElement) ||
        getClosestToolbarNextScopeRoot(relatedTarget) !== scopeRoot;

      if (!enteringFromOutside) {
        rememberTarget(target);
        return;
      }

      const targetMemory = getToolbarNextFocusMemory(scopeRoot, target, {
        includeTabIndexMinusOne,
      });
      if (targetMemory?.type === "overflow-trigger") {
        if (shouldPreserveItemMemoryForTrigger(targetMemory.groupKey)) {
          return;
        }

        rememberedFocusRef.current = targetMemory;
        return;
      }

      const restoreTarget = resolveToolbarNextFocusTarget(
        scopeRoot,
        rememberedFocusRef.current,
        {
          items,
          includeTabIndexMinusOne,
          overflowedIds,
        },
      );

      if (restoreTarget && restoreTarget !== target) {
        restoringEntryFocusRef.current = true;

        const restoreFocus = () => {
          restoreFrameRef.current = null;

          focusToolbarNextElement(restoreTarget);
        };
        const win = restoreTarget.ownerDocument.defaultView;

        if (win?.requestAnimationFrame) {
          const currentFrame = restoreFrameRef.current;
          if (currentFrame != null) {
            win.cancelAnimationFrame(currentFrame);
          }

          restoreFrameRef.current = win.requestAnimationFrame(restoreFocus);
        } else {
          queueMicrotask(restoreFocus);
        }

        return;
      }

      rememberTarget(target);
    },
    [
      includeTabIndexMinusOne,
      items,
      overflowedIds,
      rememberTarget,
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

  const handleScopeBlur = useCallback(
    (event: ToolbarNextFocusEvent) => {
      const scopeRoot = scopeRef.current;
      const target = event.target;

      if (
        !scopeRoot ||
        !(target instanceof HTMLElement) ||
        getClosestToolbarNextScopeRoot(target) !== scopeRoot
      ) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      const leavingScope =
        !(relatedTarget instanceof HTMLElement) ||
        getClosestToolbarNextScopeRoot(relatedTarget) !== scopeRoot;

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
    (event: ToolbarNextKeyDownEvent) => {
      const scopeRoot = scopeRef.current;
      const target = event.target;

      if (
        !scopeRoot ||
        !(target instanceof HTMLElement) ||
        getClosestToolbarNextScopeRoot(target) !== scopeRoot ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (
        event.key === "Tab" &&
        scopeRoot.getAttribute(TOOLBAR_NEXT_SCOPE_ROOT_ATTR) === "main" &&
        !shouldToolbarNextPreserveNativeTab(target)
      ) {
        const moveTarget = getToolbarNextTabMoveTarget(
          scopeRoot,
          event.shiftKey,
        );

        event.preventDefault();
        event.stopPropagation();

        rememberTarget(target);
        queueMicrotask(() => {
          if (moveTarget?.isConnected) {
            focusToolbarNextElement(moveTarget);
          } else {
            target.blur();
          }
        });
        return;
      }

      const moveTarget = getToolbarNextDirectionalMoveTarget(
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
      focusToolbarNextElement(moveTarget);
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
      resolveToolbarNextFocusTarget(scopeRoot, rememberedFocusRef.current, {
        items,
        includeTabIndexMinusOne,
        overflowedIds,
      }) ??
      getToolbarNextScopeFocusableElements(scopeRoot, {
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
    handleScopeBlur,
    handleScopeFocus,
    handleScopeKeyDown,
    rememberItemFocus,
    rememberedFocusRef,
  };
}

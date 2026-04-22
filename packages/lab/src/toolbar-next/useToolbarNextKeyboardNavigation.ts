import {
  type FocusEventHandler,
  type KeyboardEventHandler,
  type RefObject,
  useCallback,
  useRef,
} from "react";
import {
  getClosestToolbarNextScopeRoot,
  getToolbarNextDirectionalMoveTarget,
  getToolbarNextFocusMemory,
  getToolbarNextScopeFocusableElements,
  resolveToolbarNextFocusTarget,
  type ToolbarNextFocusMemory,
} from "./toolbarNextKeyboardUtils";
import type { ToolbarNextOverflowItem } from "./toolbarNextUtils";

interface UseToolbarNextKeyboardNavigationProps {
  items?: ToolbarNextOverflowItem[];
  overflowedIds?: Set<string>;
  scopeRef: RefObject<HTMLElement | null>;
}

export function useToolbarNextKeyboardNavigation({
  items = [],
  overflowedIds,
  scopeRef,
}: UseToolbarNextKeyboardNavigationProps) {
  const rememberedFocusRef = useRef<ToolbarNextFocusMemory | null>(null);
  const restoringEntryFocusRef = useRef(false);

  const rememberTarget = useCallback(
    (target: HTMLElement) => {
      const scopeRoot = scopeRef.current;

      if (!scopeRoot) {
        return;
      }

      const focusMemory = getToolbarNextFocusMemory(scopeRoot, target);

      if (focusMemory) {
        rememberedFocusRef.current = focusMemory;
      }
    },
    [scopeRef],
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
        overflowedIds,
      },
    );

    if (!target) {
      return;
    }

    queueMicrotask(() => {
      target.focus({ preventScroll: true });
    });
  }, [items, overflowedIds, scopeRef]);

  const handleFocusCapture = useCallback<FocusEventHandler<HTMLElement>>(
    (event) => {
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

      const restoreTarget = resolveToolbarNextFocusTarget(
        scopeRoot,
        rememberedFocusRef.current,
        {
          items,
          overflowedIds,
        },
      );

      if (restoreTarget && restoreTarget !== target) {
        restoringEntryFocusRef.current = true;

        queueMicrotask(() => {
          restoreTarget.focus({ preventScroll: true });
        });

        return;
      }

      rememberTarget(target);
    },
    [items, overflowedIds, rememberTarget, scopeRef],
  );

  const handleBlurCapture = useCallback<FocusEventHandler<HTMLElement>>(
    (event) => {
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

  const handleKeyDownCapture = useCallback<KeyboardEventHandler<HTMLElement>>(
    (event) => {
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

      const moveTarget = getToolbarNextDirectionalMoveTarget(
        scopeRoot,
        target,
        event.key,
      );

      if (!moveTarget) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      rememberTarget(moveTarget);
      moveTarget.focus({ preventScroll: true });
    },
    [rememberTarget, scopeRef],
  );

  const getEntryFocusable = useCallback(() => {
    const scopeRoot = scopeRef.current;

    if (!scopeRoot) {
      return null;
    }

    return (
      resolveToolbarNextFocusTarget(scopeRoot, rememberedFocusRef.current, {
        items,
        overflowedIds,
      }) ??
      getToolbarNextScopeFocusableElements(scopeRoot)[0] ??
      null
    );
  }, [items, overflowedIds, scopeRef]);

  return {
    focusEntryTarget,
    getEntryFocusable,
    handleBlurCapture,
    handleFocusCapture,
    handleKeyDownCapture,
    rememberedFocusRef,
  };
}

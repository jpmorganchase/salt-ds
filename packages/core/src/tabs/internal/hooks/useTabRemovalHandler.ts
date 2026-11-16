import {
  type MutableRefObject,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useEventCallback } from "../../../utils/useEventCallback";
import { useIsomorphicLayoutEffect } from "../../../utils/useIsomorphicLayoutEffect";
import type { Item, TabsContextValue } from "../contexts/TabsContext";
import { isHTMLElement } from "../utils/domUtils";

interface RemovedItem {
  id: string;
  value: string;
  staleIndex?: number;
}

interface UseTabRemovalHandlerArgs {
  activeTab: MutableRefObject<Pick<Item, "id" | "value"> | undefined>;
  canRecoverRemovalFocus: () => boolean;
  focusElementWithRetry: (
    getElement: () => HTMLElement | null | undefined,
  ) => void;
  getFirst: TabsContextValue["getFirst"];
  getIndex: TabsContextValue["getIndex"];
  getLast: TabsContextValue["getLast"];
  getRemovedItems: () => Map<string, RemovedItem>;
  getRenderedTab: TabsContextValue["getRenderedTab"];
  getSelectedTabElement: () => HTMLElement | null | undefined;
  isMeasuring: boolean;
  item: TabsContextValue["item"];
  itemAt: TabsContextValue["itemAt"];
  maxRetryAttempts: number;
  menuOpen: boolean;
  overflowButtonRef: RefObject<HTMLButtonElement | null>;
  overflowListRef: RefObject<HTMLDivElement | null>;
  peekRemovedItems: () => Map<string, RemovedItem>;
  pendingRemovalRecoveryRef: MutableRefObject<boolean>;
  pendingRemovalRecoveryRetriesRef: MutableRefObject<number>;
  removalRecoveryRafRef: MutableRefObject<number | null>;
  removalVersion: number;
  selected?: string;
  setSelected: TabsContextValue["setSelected"];
  tabstripRef: RefObject<HTMLDivElement | null>;
  targetWindow: Window | null | undefined;
}

function hasLostDocumentFocus(doc: Document) {
  const activeElement = doc.activeElement;
  return (
    !activeElement ||
    activeElement === doc.body ||
    activeElement === doc.documentElement ||
    !activeElement.isConnected
  );
}

export function useTabRemovalHandler({
  activeTab,
  canRecoverRemovalFocus,
  focusElementWithRetry,
  getFirst,
  getIndex,
  getLast,
  getRemovedItems,
  getRenderedTab,
  getSelectedTabElement,
  isMeasuring,
  item,
  itemAt,
  maxRetryAttempts,
  menuOpen,
  overflowButtonRef,
  overflowListRef,
  peekRemovedItems,
  pendingRemovalRecoveryRef,
  pendingRemovalRecoveryRetriesRef,
  removalRecoveryRafRef,
  removalVersion,
  selected,
  setSelected,
  tabstripRef,
  targetWindow,
}: UseTabRemovalHandlerArgs) {
  // Ends a recovery cycle. Selection replacement has already considered each
  // removal record, and focus recovery doesn't look at records once the cycle
  // ends, so drop any that are left rather than holding on to removed
  // elements.
  const clearPendingRemovalRecovery = useCallback(() => {
    pendingRemovalRecoveryRef.current = false;
    pendingRemovalRecoveryRetriesRef.current = 0;
    getRemovedItems();
  }, [
    getRemovedItems,
    pendingRemovalRecoveryRef,
    pendingRemovalRecoveryRetriesRef,
  ]);

  // Records are kept until a recovery cycle ends, so a record can be seen by
  // several removal updates. Each is only considered for selection
  // replacement once. Restoring and removing a tab creates a new record, even
  // when its explicit id is reused.
  const seenRemovalsRef = useRef(new WeakSet<RemovedItem>());
  // The removal record whose selection was replaced. Focus recovery runs
  // later, once selected is already the replacement.
  const replacedRemovalRef = useRef<RemovedItem | null>(null);
  const replacementPendingRef = useRef(false);
  const remeasureStartedRef = useRef(false);

  const getReplacementTab = (baseIndex: number) => {
    let nextTab =
      (baseIndex >= 0 ? itemAt(baseIndex) : null) ??
      (baseIndex > 0 ? itemAt(baseIndex - 1) : null) ??
      getLast() ??
      getFirst();

    if (nextTab?.element === overflowButtonRef.current) {
      const overflowIndex = getIndex(nextTab.id);
      nextTab =
        (overflowIndex > 0 ? itemAt(overflowIndex - 1) : null) ??
        (baseIndex > 0 ? itemAt(baseIndex - 1) : null) ??
        getFirst();
    }

    return nextTab?.element ? nextTab : null;
  };

  const afterLayout = (callback: () => void) => {
    if (!targetWindow?.requestAnimationFrame) {
      callback();
      return;
    }

    targetWindow.requestAnimationFrame(() => {
      targetWindow.requestAnimationFrame(callback);
    });
  };

  // Selection follows a removed selected tab wherever focus is, e.g. when the
  // tab is removed by a control outside the tabs or while the overflow menu is
  // open.
  const replaceRemovedSelection = useEventCallback(() => {
    replacementPendingRef.current = false;
    const selectedIsRemoved =
      selected !== undefined && !getRenderedTab(selected);
    let removedSelected: RemovedItem | undefined;
    for (const removed of peekRemovedItems().values()) {
      if (seenRemovalsRef.current.has(removed)) continue;

      seenRemovalsRef.current.add(removed);
      if (selectedIsRemoved && removed.value === selected) {
        removedSelected = removed;
      }
    }
    if (!removedSelected) return;

    const nextTab = getReplacementTab(removedSelected.staleIndex ?? -1);
    if (!nextTab) return;

    replacedRemovalRef.current = removedSelected;
    setSelected(null, nextTab.value, "removal");
  });

  // The neighbor is chosen from the tabs that are visible once the overflow
  // layout has been measured again after the removal. Measuring happens in
  // layout effects, so the selection is normally replaced before the browser
  // paints and there's no frame without a selected tab. The layout doesn't
  // change while the overflow menu is open.
  useIsomorphicLayoutEffect(() => {
    if (removalVersion > 0) {
      replacementPendingRef.current = true;
      remeasureStartedRef.current = false;
    }
  }, [removalVersion]);

  useIsomorphicLayoutEffect(() => {
    if (!replacementPendingRef.current) return;

    if (isMeasuring && !menuOpen) {
      remeasureStartedRef.current = true;
      return;
    }

    if (remeasureStartedRef.current || menuOpen) {
      replaceRemovedSelection();
    }
  });

  const wasSelected = (
    value: string | undefined,
    removed: RemovedItem | undefined,
  ) =>
    value !== undefined &&
    (value === selected ||
      (removed !== undefined && removed === replacedRemovalRef.current));

  const handleTabRemoval = useEventCallback(() => {
    const doc = targetWindow?.document;
    if (!doc) return;

    // Falls back to replacing the selection here if the overflow layout
    // wasn't measured again, e.g. when the tabs are hidden.
    if (replacementPendingRef.current) {
      replaceRemovedSelection();
    }

    if (!canRecoverRemovalFocus()) {
      clearPendingRemovalRecovery();
      return;
    }

    const activeTabWasSelected = wasSelected(
      activeTab.current?.value,
      activeTab.current
        ? peekRemovedItems().get(activeTab.current.id)
        : undefined,
    );

    const shouldRecoverFocus = () => {
      if (hasLostDocumentFocus(doc)) return true;

      const activeElement = doc.activeElement;
      if (!isHTMLElement(activeElement)) return false;

      if (!menuOpen) {
        if (activeElement === overflowButtonRef.current) {
          return activeTabWasSelected;
        }

        return (
          tabstripRef.current?.contains(activeElement) &&
          activeElement.getAttribute("role") !== "tab"
        );
      }

      if (activeElement === overflowButtonRef.current) {
        return true;
      }

      if (overflowListRef.current?.contains(activeElement)) {
        // When closing tabs from the overflow menu, focus can remain within
        // the floating UI rather than falling back to body.
        return activeElement.getAttribute("role") !== "tab";
      }

      return false;
    };

    // If focus was lost due to deletion, browsers may report body/html or a
    // disconnected active element depending on browser behavior.
    if (!shouldRecoverFocus()) {
      if (
        pendingRemovalRecoveryRef.current &&
        removalRecoveryRafRef.current == null
      ) {
        if (pendingRemovalRecoveryRetriesRef.current < maxRetryAttempts) {
          pendingRemovalRecoveryRetriesRef.current += 1;
          if (!targetWindow?.requestAnimationFrame) {
            handleTabRemoval();
            return;
          }

          removalRecoveryRafRef.current = targetWindow.requestAnimationFrame(
            () => {
              removalRecoveryRafRef.current = null;
              handleTabRemoval();
            },
          );
        } else {
          clearPendingRemovalRecovery();
        }
      }
      return;
    }

    if (!activeTab.current) {
      clearPendingRemovalRecovery();
      return;
    }

    const removedItems = getRemovedItems();
    const removed = removedItems.get(activeTab.current.id);
    if (!removed) {
      clearPendingRemovalRecovery();
      return;
    }

    clearPendingRemovalRecovery();
    const removedWasSelected = wasSelected(removed.value, removed);
    const baseIndex = removed.staleIndex ?? -1;
    const removedId = removed.id;

    const restoreFocus = () => {
      const restoredTab = item(removedId);
      const restoredRenderedTab = getRenderedTab(removed.value);
      const focusMovedToOverflowButton =
        doc.activeElement === overflowButtonRef.current;

      // Overflow menu updates can temporarily remount tabs. If the tab is
      // back and focus was lost to a disconnected node, restore focus to the
      // remounted tab rather than treating it as a real deletion.
      if (
        restoredTab?.element?.isConnected &&
        restoredRenderedTab?.trigger === restoredTab.element &&
        !(removedWasSelected && focusMovedToOverflowButton)
      ) {
        if (shouldRecoverFocus()) {
          focusElementWithRetry(() => item(removedId)?.element);
        }
        return;
      }

      if (!shouldRecoverFocus()) {
        return;
      }

      const nextTab = getReplacementTab(baseIndex);
      if (!nextTab) return;

      // activeTab isn't updated here; focusing the tab updates it through
      // the tab's focus handlers.
      focusElementWithRetry(() => {
        if (removedWasSelected) {
          return getSelectedTabElement() ?? nextTab.element;
        }

        return nextTab.element;
      });
    };

    afterLayout(restoreFocus);
  });

  useEffect(() => {
    return () => {
      if (removalRecoveryRafRef.current != null && targetWindow) {
        targetWindow.cancelAnimationFrame(removalRecoveryRafRef.current);
      }
    };
  }, [removalRecoveryRafRef, targetWindow]);

  return handleTabRemoval;
}

import {
  type MutableRefObject,
  type RefObject,
  useCallback,
  useEffect,
} from "react";
import { useEventCallback } from "../../../utils/useEventCallback";
import type { Item, TabsContextValue } from "../contexts/TabsContext";
import { isHTMLElement } from "../utils/domUtils";

interface RemovedItem {
  id: string;
  value: string;
  staleIndex?: number;
}

interface UseTabRemovalHandlerArgs {
  activeTab: MutableRefObject<Pick<Item, "id" | "value"> | undefined>;
  focusElementWithRetry: (
    getElement: () => HTMLElement | null | undefined,
  ) => void;
  getFirst: TabsContextValue["getFirst"];
  getIndex: TabsContextValue["getIndex"];
  getLast: TabsContextValue["getLast"];
  getRemovedItems: () => Map<string, RemovedItem>;
  getRenderedTab: TabsContextValue["getRenderedTab"];
  getSelectedTabElement: () => HTMLElement | null | undefined;
  item: TabsContextValue["item"];
  itemAt: TabsContextValue["itemAt"];
  maxRetryAttempts: number;
  menuOpen: boolean;
  overflowButtonRef: RefObject<HTMLButtonElement | null>;
  overflowListRef: RefObject<HTMLDivElement | null>;
  pendingRemovalRecoveryRef: MutableRefObject<boolean>;
  pendingRemovalRecoveryRetriesRef: MutableRefObject<number>;
  removalRecoveryRafRef: MutableRefObject<number | null>;
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

function getVisibleSelectedTab(
  tabstrip: HTMLDivElement | null,
  excludedId?: string,
) {
  if (!tabstrip) {
    return null;
  }

  const tabs = tabstrip.querySelectorAll<HTMLElement>(
    ':scope > [data-tabslot] [role="tab"][aria-selected="true"]',
  );

  return (
    Array.from(tabs).find((tab) => {
      if (excludedId && tab.id === excludedId) {
        return false;
      }

      return tab.isConnected;
    }) ?? null
  );
}

export function useTabRemovalHandler({
  activeTab,
  focusElementWithRetry,
  getFirst,
  getIndex,
  getLast,
  getRemovedItems,
  getRenderedTab,
  getSelectedTabElement,
  item,
  itemAt,
  maxRetryAttempts,
  menuOpen,
  overflowButtonRef,
  overflowListRef,
  pendingRemovalRecoveryRef,
  pendingRemovalRecoveryRetriesRef,
  removalRecoveryRafRef,
  selected,
  setSelected,
  tabstripRef,
  targetWindow,
}: UseTabRemovalHandlerArgs) {
  const clearPendingRemovalRecovery = useCallback(() => {
    pendingRemovalRecoveryRef.current = false;
    pendingRemovalRecoveryRetriesRef.current = 0;
  }, [pendingRemovalRecoveryRef, pendingRemovalRecoveryRetriesRef]);

  const handleTabRemoval = useEventCallback(() => {
    const doc = targetWindow?.document;
    if (!doc) return;

    const activeTabWasSelected = activeTab.current?.value === selected;

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
    const removedWasSelected = removed.value === selected;
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

      if (!nextTab?.element) return;

      if (
        removedWasSelected &&
        !menuOpen &&
        !getVisibleSelectedTab(tabstripRef.current, removedId)
      ) {
        activeTab.current = { id: nextTab.id, value: nextTab.value };
        setSelected(null, nextTab.value);
      }

      focusElementWithRetry(() => {
        if (removedWasSelected) {
          return getSelectedTabElement() ?? nextTab?.element;
        }

        return nextTab?.element;
      });
    };

    if (!targetWindow?.requestAnimationFrame) {
      restoreFocus();
      return;
    }

    targetWindow.requestAnimationFrame(() => {
      targetWindow.requestAnimationFrame(() => {
        restoreFocus();
      });
    });
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

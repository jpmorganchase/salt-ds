import { type MutableRefObject, type RefObject, useEffect } from "react";

function containsTabItemNode(nodes: NodeList) {
  return Array.from(nodes).some((node) => {
    if (!(node instanceof Element)) return false;

    return (
      node.matches("[data-overflowitem], [role='tab']") ||
      node.querySelector("[data-overflowitem], [role='tab']") !== null
    );
  });
}

interface UseTabListMutationObserverArgs {
  menuOpen: boolean;
  targetWindow: Window | null | undefined;
  tabstripRef: RefObject<HTMLDivElement | null>;
  overflowListRef: RefObject<HTMLDivElement | null>;
  sortItems: () => void;
  handleTabRemoval: () => void;
  pendingRemovalRecoveryRef: MutableRefObject<boolean>;
  pendingRemovalRecoveryRetriesRef: MutableRefObject<number>;
}

export function useTabListMutationObserver({
  menuOpen,
  targetWindow,
  tabstripRef,
  overflowListRef,
  sortItems,
  handleTabRemoval,
  pendingRemovalRecoveryRef,
  pendingRemovalRecoveryRetriesRef,
}: UseTabListMutationObserverArgs) {
  useEffect(() => {
    if (!tabstripRef.current) return;

    let raf: number | null = null;
    let sawTabRemoval = false;

    const observerCallback: MutationCallback = (records) => {
      let sawRelevantMutation = false;

      for (const record of records) {
        if (containsTabItemNode(record.removedNodes)) {
          sawRelevantMutation = true;
          sawTabRemoval = true;
          pendingRemovalRecoveryRef.current = true;
          pendingRemovalRecoveryRetriesRef.current = 0;
          continue;
        }

        if (containsTabItemNode(record.addedNodes)) {
          sawRelevantMutation = true;
        }
      }

      if (!sawRelevantMutation) {
        return;
      }

      if (raf != null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const shouldHandleTabRemoval = sawTabRemoval;
        sawTabRemoval = false;

        raf = null;
        sortItems();
        if (shouldHandleTabRemoval) {
          handleTabRemoval();
        }
      });
    };

    const observers: MutationObserver[] = [];
    const observeTarget = (node: Node | null) => {
      if (!node) return;

      const observer = new MutationObserver(observerCallback);
      observer.observe(node, { childList: true, subtree: true });
      observers.push(observer);
    };

    observeTarget(tabstripRef.current);
    if (menuOpen) {
      observeTarget(
        overflowListRef.current ?? targetWindow?.document.body ?? null,
      );
    }

    return () => {
      if (raf != null) {
        cancelAnimationFrame(raf);
      }
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [
    handleTabRemoval,
    menuOpen,
    pendingRemovalRecoveryRef,
    pendingRemovalRecoveryRetriesRef,
    sortItems,
    tabstripRef,
    overflowListRef,
    targetWindow,
  ]);
}

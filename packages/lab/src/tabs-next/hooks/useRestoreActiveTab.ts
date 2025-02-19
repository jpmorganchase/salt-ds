import { ownerWindow, useIsomorphicLayoutEffect } from "@salt-ds/core";
import {
  type MutableRefObject,
  type RefObject,
  useEffect,
  useRef,
} from "react";
import type { Item } from "./useCollection";

interface UseHandleRemovalProps {
  container: RefObject<HTMLElement>;
  tabs: Item[];
  realSelectedIndex: RefObject<number>;
  removedActiveTabRef: MutableRefObject<string | undefined>;
}

export function useRestoreActiveTab({
  container,
  tabs,
  realSelectedIndex,
  removedActiveTabRef,
}: UseHandleRemovalProps) {
  const tabsRef = useRef(tabs);
  useIsomorphicLayoutEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    if (!container.current) return;

    const win = ownerWindow(container.current);

    const mutationObserver = new win.MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const removedItem =
          mutation.removedNodes[0] instanceof HTMLElement
            ? mutation.removedNodes[0]
            : null;

        const activeTabWasRemoved =
          removedActiveTabRef.current &&
          removedItem?.dataset?.overflowitem &&
          !tabsRef.current.find(
            ({ value }) => value === removedActiveTabRef.current,
          );

        if (activeTabWasRemoved) {
          const removedTab =
            removedItem.querySelector<HTMLElement>('[role="tab"]');

          const previousTab =
            mutation.previousSibling instanceof HTMLElement
              ? mutation.previousSibling.querySelector<HTMLElement>(
                  '[role="tab"]',
                )
              : null;

          let nextTab: HTMLElement | null | undefined = null;

          if (!previousTab) {
            nextTab =
              mutation.nextSibling instanceof HTMLElement
                ? mutation.nextSibling?.querySelector<HTMLElement>(
                    '[role="tab"]',
                  )
                : null;
          } else {
            const nextTabIndex = previousTab
              ? Math.min(
                  tabsRef.current.findIndex(
                    ({ element }) => element === previousTab,
                  ) + 1,
                  tabsRef.current.length - 1,
                )
              : -1;

            const offset =
              removedTab?.ariaSelected === "true" &&
              realSelectedIndex.current != null
                ? Math.max(realSelectedIndex.current, 0)
                : 0;

            nextTab = tabsRef.current[nextTabIndex + offset]?.element;
          }

          if (
            !container.current?.querySelector<HTMLElement>(
              '[role="tab"][aria-selected="true"]',
            )
          ) {
            nextTab?.click();
          }

          if (!container.current?.contains(win.document.activeElement)) {
            if (nextTab?.isConnected) {
              nextTab?.focus({ preventScroll: true });
            } else {
              container.current
                ?.querySelector<HTMLElement>(
                  '[role="tab"][aria-selected="true"]',
                )
                ?.focus({ preventScroll: true });
            }
          }

          removedActiveTabRef.current = undefined;
        }

        if (removedActiveTabRef.current && mutation.addedNodes.length > 0) {
          const tabElement = tabsRef.current.find(
            ({ value }) => value === removedActiveTabRef.current,
          )?.element;

          if (
            tabElement &&
            mutation.addedNodes[0]?.contains(tabElement) &&
            win.document.activeElement === win.document.body
          ) {
            tabElement.focus();
          }
        }
      }
    });

    mutationObserver.observe(container.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
    };
  }, [container, realSelectedIndex, removedActiveTabRef]);
}

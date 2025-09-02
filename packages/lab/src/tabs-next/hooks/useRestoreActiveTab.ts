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
  const previousTabsRef = useRef(tabs);

  useIsomorphicLayoutEffect(() => {
    tabsRef.current = tabs;

    return () => {
      previousTabsRef.current = tabs;
    };
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

        const removedItemWasTab =
          removedActiveTabRef.current && removedItem?.dataset?.overflowitem;

        const activeTabWasRemoved = !tabsRef.current.find(
          ({ value }) => value === removedActiveTabRef.current,
        );

        if (removedItemWasTab && activeTabWasRemoved) {
          const removedTab =
            removedItem?.querySelector<HTMLElement>('[role="tab"]');

          let nextTab: HTMLElement | null | undefined = null;

          if (
            removedTab?.ariaSelected === "true" &&
            realSelectedIndex.current != null &&
            realSelectedIndex.current >= 0
          ) {
            nextTab =
              tabsRef.current[
                Math.min(realSelectedIndex.current, tabsRef.current.length - 1)
              ]?.element;
          }

          if (!nextTab) {
            const previousTab =
              mutation.previousSibling instanceof HTMLElement
                ? mutation.previousSibling.querySelector<HTMLElement>(
                    '[role="tab"]',
                  )
                : null;

            if (!previousTab) {
              nextTab =
                mutation.nextSibling instanceof HTMLElement
                  ? mutation.nextSibling?.querySelector<HTMLElement>(
                      '[role="tab"]',
                    )
                  : null;
            } else {
              const nextTabIndex = previousTab
                ? tabsRef.current.findIndex(
                    ({ element }) => element === previousTab,
                  ) + 1
                : -1;

              nextTab =
                tabsRef.current[
                  Math.min(nextTabIndex, tabsRef.current.length - 1)
                ]?.element;
            }
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

        // Focus the tab if it was moved from the overflow menu into the visible tabs
        if (removedActiveTabRef.current) {
          if (removedItemWasTab) {
            const tabElement = tabsRef.current.find(
              ({ value }) => value === removedActiveTabRef.current,
            )?.element;

            if (win.document.activeElement === win.document.body) {
              tabElement?.focus();
            }
            // If the active tab was removed and the overflow menu has been removed focus the last visible tab.
          } else if (activeTabWasRemoved && removedItem?.dataset.overflow) {
            tabsRef.current[tabsRef.current.length - 1]?.element?.focus();
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

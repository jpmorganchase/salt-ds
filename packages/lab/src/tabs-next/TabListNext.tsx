import {
  capitalize,
  makePrefixer,
  useAriaAnnouncer,
  useForkRef,
  useIsomorphicLayoutEffect,
  usePrevious,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { computeAccessibleName } from "dom-accessibility-api";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { useEventCallback } from "../utils/useEventCallback";
import { useOverflow } from "./hooks/useOverflow";
import { useTabListFocusOutRecovery } from "./hooks/useTabListFocusOutRecovery";
import { useTabListMutationObserver } from "./hooks/useTabListMutationObserver";
import tablistNextCss from "./TabListNext.css";
import { TabOverflowList } from "./TabOverflowList";
import { useTabsNext } from "./TabsNextContext";

const withBaseName = makePrefixer("saltTabListNext");

export interface TabListNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * Styling active color variant. Defaults to "primary".
   */
  activeColor?: "primary" | "secondary" | "tertiary";
  /**
   * The appearance of the tabs. Defaults to "bordered".
   */
  appearance?: "bordered" | "transparent";
}

function getTabAccessibleName(element: HTMLElement) {
  return computeAccessibleName(element).trim();
}

export const TabListNext = forwardRef<HTMLDivElement, TabListNextProps>(
  function TabListNext(props, ref) {
    const {
      appearance = "bordered",
      activeColor = "primary",
      children,
      className,
      onKeyDown,
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tablist-next",
      css: tablistNextCss,
      window: targetWindow,
    });

    const {
      selected,
      setSelected,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      item,
      itemAt,
      activeTab,
      menuOpen,
      setMenuOpen,
      sortItems,
      getRemovedItems,
    } = useTabsNext();

    const tabstripRef = useRef<HTMLDivElement>(null);
    const overflowListRef = useRef<HTMLDivElement>(null);
    const removalRecoveryRafRef = useRef<number | null>(null);
    const selectionFocusOuterRafRef = useRef<number | null>(null);
    const selectionFocusInnerRafRef = useRef<number | null>(null);
    const pendingRemovalRecoveryRef = useRef(false);
    const pendingRemovalRecoveryRetriesRef = useRef(0);
    const clearPendingRemovalRecovery = () => {
      pendingRemovalRecoveryRef.current = false;
      pendingRemovalRecoveryRetriesRef.current = 0;
    };

    const handleRef = useForkRef(tabstripRef, ref);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);

    const { announce } = useAriaAnnouncer();

    const [visible, hidden, isMeasuring] = useOverflow({
      container: tabstripRef,
      children,
      selected,
      overflowButton: overflowButtonRef,
    });

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (menuOpen) return;

      const actionMap = {
        ArrowRight: getNext,
        ArrowLeft: getPrevious,
        Home: getFirst,
        End: getLast,
      };

      const action = actionMap[event.key as keyof typeof actionMap];

      if (action) {
        event.preventDefault();
        // Item registration/sorting is raf-driven; flush before keyboard nav to
        // avoid navigating against stale collection order/registration.
        sortItems();
        const activeTabId = activeTab.current?.id;
        if (!activeTabId) return;
        const nextItem = action(activeTabId);
        if (nextItem) {
          // Scrolling is handled by TabTrigger.
          nextItem.element?.focus({ preventScroll: true });
        }
      }
    };

    const previousSelected = usePrevious(selected, [selected]);
    const previousMenuOpen = usePrevious(menuOpen, [menuOpen]);
    const selectedFromOverflow =
      !!previousMenuOpen &&
      !menuOpen &&
      !!selected &&
      selected !== previousSelected;

    const getSelectedTabElement = useEventCallback(() => {
      return (
        tabstripRef.current?.querySelector<HTMLElement>(
          '[role="tab"][aria-selected="true"]',
        ) ?? item(activeTab.current?.id)?.element
      );
    });

    const cancelScheduledSelectionFocus = useEventCallback(() => {
      if (selectionFocusOuterRafRef.current != null && targetWindow) {
        targetWindow.cancelAnimationFrame(selectionFocusOuterRafRef.current);
        selectionFocusOuterRafRef.current = null;
      }

      if (selectionFocusInnerRafRef.current != null && targetWindow) {
        targetWindow.cancelAnimationFrame(selectionFocusInnerRafRef.current);
        selectionFocusInnerRafRef.current = null;
      }
    });

    const scheduleSelectedTabFocus = useEventCallback(() => {
      const focusSelectedTab = () => {
        getSelectedTabElement()?.focus({ preventScroll: true });
      };

      cancelScheduledSelectionFocus();

      if (targetWindow?.requestAnimationFrame) {
        selectionFocusOuterRafRef.current = targetWindow.requestAnimationFrame(
          () => {
            selectionFocusOuterRafRef.current = null;
            selectionFocusInnerRafRef.current =
              targetWindow.requestAnimationFrame(() => {
                selectionFocusInnerRafRef.current = null;
                focusSelectedTab();
              });
          },
        );
      } else {
        queueMicrotask(() => {
          focusSelectedTab();
        });
      }
    });

    // Handle select from menu
    useIsomorphicLayoutEffect(() => {
      if (!selectedFromOverflow) {
        return;
      }
      scheduleSelectedTabFocus();
    }, [scheduleSelectedTabFocus, selectedFromOverflow]);

    useEffect(() => {
      return cancelScheduledSelectionFocus;
    }, [cancelScheduledSelectionFocus]);

    useEffect(() => {
      return () => {
        if (removalRecoveryRafRef.current != null) {
          cancelAnimationFrame(removalRecoveryRafRef.current);
        }
      };
    }, []);

    useIsomorphicLayoutEffect(() => {
      if (!selectedFromOverflow || !selected) {
        return;
      }

      const selectedTab = getSelectedTabElement();
      const selectedTabName = selectedTab
        ? getTabAccessibleName(selectedTab)
        : selected;

      announce(`${selectedTabName} moved to main tab list`, 150);
    }, [announce, getSelectedTabElement, selected, selectedFromOverflow]);

    const handleTabRemoval = useEventCallback(() => {
      const doc = targetWindow?.document;
      if (!doc) return;

      const focusWasLost = () => {
        const activeElement = doc.activeElement;

        if (!activeElement) return true;
        if (
          activeElement === doc.body ||
          activeElement === doc.documentElement
        ) {
          return true;
        }

        return !activeElement.isConnected;
      };

      const shouldRecoverFocus = () => {
        if (focusWasLost()) return true;

        const activeElement = doc.activeElement;
        if (!menuOpen || !(activeElement instanceof HTMLElement)) return false;

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
          if (pendingRemovalRecoveryRetriesRef.current < 120) {
            pendingRemovalRecoveryRetriesRef.current += 1;
            removalRecoveryRafRef.current = requestAnimationFrame(() => {
              removalRecoveryRafRef.current = null;
              handleTabRemoval();
            });
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

        // Overflow menu updates can temporarily remount tabs. If the tab is
        // back and focus was lost to a disconnected node, restore focus to the
        // remounted tab rather than treating it as a real deletion.
        if (restoredTab?.element) {
          if (shouldRecoverFocus()) {
            restoredTab.element.focus();
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
          nextTab =
            (baseIndex > 0 ? itemAt(baseIndex - 1) : null) ??
            getLast() ??
            getFirst();
        }

        if (!nextTab?.element) return;

        if (
          removedWasSelected &&
          !menuOpen &&
          !tabstripRef.current?.querySelector(
            '[role="tab"][aria-selected="true"]',
          )
        ) {
          activeTab.current = { id: nextTab.id, value: nextTab.value };
          setSelected(null, nextTab.value);
        }

        requestAnimationFrame(() => {
          nextTab?.element?.focus();
        });
      };

      requestAnimationFrame(() => requestAnimationFrame(() => restoreFocus()));
    });

    useTabListFocusOutRecovery({
      targetWindow,
      tabstripRef,
      overflowListRef,
      handleTabRemoval,
    });

    useTabListMutationObserver({
      menuOpen,
      targetWindow,
      tabstripRef,
      overflowListRef,
      sortItems,
      handleTabRemoval,
      pendingRemovalRecoveryRef,
      pendingRemovalRecoveryRetriesRef,
    });

    return (
      <div
        role="tablist"
        className={clsx(
          withBaseName(),
          withBaseName(appearance),
          withBaseName("horizontal"),
          withBaseName(`activeColor${capitalize(activeColor)}`),
          className,
        )}
        data-ismeasuring={isMeasuring ? true : undefined}
        ref={handleRef}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {visible}
        <TabOverflowList
          isMeasuring={isMeasuring}
          buttonRef={overflowButtonRef}
          open={menuOpen}
          setOpen={setMenuOpen}
          ref={overflowListRef}
        >
          {hidden}
        </TabOverflowList>
      </div>
    );
  },
);

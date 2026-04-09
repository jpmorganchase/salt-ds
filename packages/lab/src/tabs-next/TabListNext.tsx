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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEventCallback } from "../utils/useEventCallback";
import { useOverflow } from "./hooks/useOverflow";
import { useTabListRecovery } from "./hooks/useTabListRecovery";
import {
  TabListLayoutContext,
  type TabSlotLocation,
} from "./TabListLayoutContext";
import tablistNextCss from "./TabListNext.css";
import { TabOverflowList } from "./TabOverflowList";
import { TabSlot } from "./TabSlot";
import { TabSlotRegistryContext } from "./TabSlotRegistryContext";
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
      getIndex,
      item,
      itemAt,
      activeTab,
      selectionFromOverflowRef,
      menuOpen,
      setMenuOpen,
      sortItems,
      getRemovedItems,
      getRenderedTab,
      renderedTabs,
      removalVersion,
    } = useTabsNext();

    const tabstripRef = useRef<HTMLDivElement>(null);
    const overflowListRef = useRef<HTMLDivElement>(null);
    const slotMapRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const removalRecoveryRafRef = useRef<number | null>(null);
    const selectionFocusOuterRafRef = useRef<number | null>(null);
    const pendingRemovalRecoveryRef = useRef(false);
    const pendingRemovalRecoveryRetriesRef = useRef(0);
    const [slotVersion, setSlotVersion] = useState(0);
    const clearPendingRemovalRecovery = () => {
      pendingRemovalRecoveryRef.current = false;
      pendingRemovalRecoveryRetriesRef.current = 0;
    };

    const handleRef = useForkRef(tabstripRef, ref);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);

    const { announce } = useAriaAnnouncer();

    const [visibleValues, hiddenValues, isMeasuring] = useOverflow({
      container: tabstripRef,
      menuOpen,
      selected,
      tabs: renderedTabs,
      overflowButton: overflowButtonRef,
    });
    const [overflowActiveValue, setOverflowActiveValue] = useState<
      string | null
    >(null);

    useEffect(() => {
      if (!menuOpen) {
        setOverflowActiveValue(null);
        return;
      }

      setOverflowActiveValue((currentValue) => {
        if (currentValue && hiddenValues.includes(currentValue)) {
          return currentValue;
        }

        return hiddenValues[0] ?? null;
      });
    }, [hiddenValues, menuOpen]);

    const hiddenValueSet = useMemo(() => new Set(hiddenValues), [hiddenValues]);
    const visibleValueSet = useMemo(
      () => new Set(visibleValues),
      [visibleValues],
    );

    const getLocation = useCallback(
      (value: string): TabSlotLocation => {
        if (visibleValueSet.has(value)) {
          return "main";
        }

        if (menuOpen && hiddenValueSet.has(value)) {
          return "overflow";
        }

        return "hidden";
      },
      [hiddenValueSet, menuOpen, visibleValueSet],
    );

    const moveOverflowFocus = useCallback(
      (key: "ArrowDown" | "ArrowUp" | "Home" | "End", value: string) => {
        if (hiddenValues.length < 1) {
          return false;
        }

        const currentIndex = hiddenValues.indexOf(value);
        const fallbackIndex = overflowActiveValue
          ? hiddenValues.indexOf(overflowActiveValue)
          : 0;
        const startIndex =
          currentIndex >= 0 ? currentIndex : Math.max(0, fallbackIndex);
        const lastIndex = hiddenValues.length - 1;
        let nextIndex = startIndex;

        switch (key) {
          case "ArrowDown":
            nextIndex = startIndex >= lastIndex ? 0 : startIndex + 1;
            break;
          case "ArrowUp":
            nextIndex = startIndex <= 0 ? lastIndex : startIndex - 1;
            break;
          case "Home":
            nextIndex = 0;
            break;
          case "End":
            nextIndex = lastIndex;
            break;
        }

        const nextValue = hiddenValues[nextIndex];
        if (!nextValue) {
          return false;
        }

        setOverflowActiveValue(nextValue);
        return true;
      },
      [hiddenValues, overflowActiveValue],
    );

    const tabListLayoutContext = useMemo(
      () => ({
        getLocation,
        overflowActiveValue,
        setOverflowActiveValue,
        moveOverflowFocus,
      }),
      [getLocation, moveOverflowFocus, overflowActiveValue],
    );
    const registerSlot = useCallback(
      (slotId: string, element: HTMLDivElement | null) => {
        const currentElement = slotMapRef.current.get(slotId) ?? null;
        if (currentElement === element) {
          return;
        }

        if (element) {
          slotMapRef.current.set(slotId, element);
        } else {
          slotMapRef.current.delete(slotId);
        }

        setSlotVersion((currentVersion) => currentVersion + 1);
      },
      [],
    );
    const slotRegistryContext = useMemo(
      () => ({ registerSlot }),
      [registerSlot],
    );
    const slotAssignments = useMemo(() => {
      const nextAssignments = new Map<string, string>();

      for (const value of visibleValues) {
        nextAssignments.set(value, `main:${value}`);
      }

      for (const value of hiddenValues) {
        nextAssignments.set(
          value,
          menuOpen ? `overflow:${value}` : `measure:${value}`,
        );
      }

      return {
        map: nextAssignments,
        version: slotVersion,
      };
    }, [hiddenValues, menuOpen, slotVersion, visibleValues]);

    useIsomorphicLayoutEffect(() => {
      for (const [value, slotId] of slotAssignments.map) {
        const host = getRenderedTab(value)?.host;
        const slot = slotMapRef.current.get(slotId);

        if (host && slot && host.parentElement !== slot) {
          slot.appendChild(host);
        }
      }
    }, [getRenderedTab, slotAssignments]);

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

    const selectionChangedFromOverflow =
      !!selected &&
      !!previousSelected &&
      selected !== previousSelected &&
      selectionFromOverflowRef.current;

    const getSelectedTabElement = useCallback(() => {
      return (
        tabstripRef.current?.querySelector<HTMLElement>(
          '[role="tab"][aria-selected="true"]',
        ) ?? item(activeTab.current?.id)?.element
      );
    }, [item, activeTab]);

    const cancelScheduledSelectionFocus = useCallback(() => {
      if (selectionFocusOuterRafRef.current != null && targetWindow) {
        targetWindow.cancelAnimationFrame(selectionFocusOuterRafRef.current);
        selectionFocusOuterRafRef.current = null;
      }
    }, [targetWindow]);

    const focusElementWithRetry = useCallback(
      (getElement: () => HTMLElement | null | undefined) => {
        const doc = targetWindow?.document;
        if (!doc) {
          getElement()?.focus({ preventScroll: true });
          return;
        }

        cancelScheduledSelectionFocus();

        let attempts = 0;

        const focusElement = () => {
          const element = getElement();
          if (!element?.isConnected) {
            if (attempts >= 120 || !targetWindow?.requestAnimationFrame) {
              return;
            }

            attempts += 1;
            selectionFocusOuterRafRef.current =
              targetWindow.requestAnimationFrame(focusElement);
            return;
          }

          element.focus({ preventScroll: true });

          if (doc.activeElement === element || attempts >= 120) {
            selectionFocusOuterRafRef.current = null;
            return;
          }

          attempts += 1;
          if (targetWindow?.requestAnimationFrame) {
            selectionFocusOuterRafRef.current =
              targetWindow.requestAnimationFrame(focusElement);
          } else {
            queueMicrotask(focusElement);
          }
        };

        focusElement();
      },
      [cancelScheduledSelectionFocus, targetWindow],
    );

    const scheduleSelectedTabFocus = useCallback(() => {
      focusElementWithRetry(getSelectedTabElement);
    }, [focusElementWithRetry, getSelectedTabElement]);

    useIsomorphicLayoutEffect(() => {
      if (!menuOpen || !overflowActiveValue) {
        return;
      }

      focusElementWithRetry(() => getRenderedTab(overflowActiveValue)?.trigger);
    }, [focusElementWithRetry, getRenderedTab, menuOpen, overflowActiveValue]);

    useIsomorphicLayoutEffect(() => {
      const doc = targetWindow?.document;
      if (
        !doc ||
        !selected ||
        !previousSelected ||
        selected === previousSelected
      ) {
        return;
      }

      const activeElement = doc.activeElement;
      const focusWasLost =
        !activeElement ||
        activeElement === doc.body ||
        activeElement === doc.documentElement ||
        !activeElement.isConnected;

      if (!focusWasLost) {
        return;
      }

      scheduleSelectedTabFocus();
    }, [previousSelected, scheduleSelectedTabFocus, selected, targetWindow]);

    useEffect(() => {
      return () => {
        cancelScheduledSelectionFocus();
        if (removalRecoveryRafRef.current != null) {
          cancelAnimationFrame(removalRecoveryRafRef.current);
        }
      };
    }, [cancelScheduledSelectionFocus]);

    // Handle select from menu
    useIsomorphicLayoutEffect(() => {
      if (!selectionChangedFromOverflow || !selected) {
        return;
      }

      scheduleSelectedTabFocus();

      const selectedTab = getSelectedTabElement();
      const selectedTabName = selectedTab
        ? getTabAccessibleName(selectedTab) || selected
        : selected;

      announce(`${selectedTabName} moved to main tab list`);
      selectionFromOverflowRef.current = false;
    }, [
      announce,
      getSelectedTabElement,
      scheduleSelectedTabFocus,
      selected,
      selectionChangedFromOverflow,
      selectionFromOverflowRef,
    ]);

    const handleTabRemoval = useEventCallback(() => {
      const doc = targetWindow?.document;
      if (!doc) return;

      const activeTabWasSelected = activeTab.current?.value === selected;

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
        if (!(activeElement instanceof HTMLElement)) return false;

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

      requestAnimationFrame(() => requestAnimationFrame(() => restoreFocus()));
    });

    useTabListRecovery({
      removalVersion,
      targetWindow,
      tabstripRef,
      overflowListRef,
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
        <TabSlotRegistryContext.Provider value={slotRegistryContext}>
          <TabListLayoutContext.Provider value={tabListLayoutContext}>
            {children}
            {visibleValues.map((value) => (
              <TabSlot key={value} slotId={`main:${value}`} value={value} />
            ))}
            {!menuOpen && hiddenValues.length > 0 ? (
              <div
                aria-hidden="true"
                className={withBaseName("measureContainer")}
              >
                {hiddenValues.map((value) => (
                  <TabSlot
                    key={`measure-${value}`}
                    slotId={`measure:${value}`}
                    value={value}
                  />
                ))}
              </div>
            ) : null}
            <TabOverflowList
              isMeasuring={isMeasuring}
              buttonRef={overflowButtonRef}
              hiddenValues={hiddenValues}
              open={menuOpen}
              order={visibleValues.length}
              setOpen={setMenuOpen}
              ref={overflowListRef}
            />
          </TabListLayoutContext.Provider>
        </TabSlotRegistryContext.Provider>
      </div>
    );
  },
);

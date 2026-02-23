import {
  capitalize,
  makePrefixer,
  useForkRef,
  useId,
  useIsomorphicLayoutEffect,
  usePrevious,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import { useEventCallback } from "../utils/index";
import { useOverflow } from "./hooks/useOverflow";
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

export const TabListNext = forwardRef<HTMLDivElement, TabListNextProps>(
  function TabstripNext(props, ref) {
    const {
      appearance = "bordered",
      activeColor = "primary",
      "aria-describedby": ariaDescribedBy,
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
    const pendingRemovalRecoveryRef = useRef(false);
    const pendingRemovalRecoveryRetriesRef = useRef(0);
    const clearPendingRemovalRecovery = () => {
      pendingRemovalRecoveryRef.current = false;
      pendingRemovalRecoveryRetriesRef.current = 0;
    };

    const handleRef = useForkRef(tabstripRef, ref);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);

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
        const activeTabId = activeTab.current?.id;
        if (!activeTabId) return;
        const nextItem = action(activeTabId);
        if (nextItem) {
          // Scrolling is handled by TabTrigger.
          nextItem.element?.focus({ preventScroll: true });
        }
      }
    };

    const previousSelected = usePrevious(selected);

    // Handle select from menu
    useIsomorphicLayoutEffect(() => {
      if (!menuOpen && selected !== previousSelected) {
        queueMicrotask(() => {
          const activeItem = item(activeTab.current?.id);

          if (activeItem) {
            activeItem.element?.focus();
          }
        });
      }
    }, [menuOpen, selected, previousSelected, item, activeTab]);

    const handleTabRemoval = useEventCallback(() => {
      const doc = targetWindow?.document;
      if (!doc) return;

      const focusWasLost = () => {
        const activeElement = doc.activeElement;

        if (!activeElement) return true;
        if (activeElement === doc.body || activeElement === doc.documentElement) {
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

      const restoreFocus = () => {
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
          !tabstripRef.current?.querySelector(
            '[role="tab"][aria-selected="true"]',
          )
        ) {
          nextTab.element?.click();
        }

        requestAnimationFrame(() => {
          nextTab?.element?.focus();
        });
      };

      requestAnimationFrame(() => requestAnimationFrame(() => restoreFocus()));
    });

    useEffect(() => {
      return () => {
        if (removalRecoveryRafRef.current != null) {
          cancelAnimationFrame(removalRecoveryRafRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const isInTabList = (node: HTMLElement | null) => {
        if (!node) return;

        return (
          (tabstripRef.current?.contains(node) ?? false) ||
          (overflowListRef.current?.contains(node) ?? false)
        );
      };

      const handleFocus = (event: FocusEvent) => {
        if (!tabstripRef.current) return;

        const wasInTablist =
          event.target instanceof HTMLElement && isInTabList(event.target);
        const stillInTablist =
          event.relatedTarget instanceof HTMLElement &&
          isInTabList(event.relatedTarget);
        if ((wasInTablist && !stillInTablist) || event.relatedTarget === null) {
          requestAnimationFrame(() => handleTabRemoval());
        }
      };

      targetWindow?.document.addEventListener("focusout", handleFocus, true);

      return () => {
        targetWindow?.document.removeEventListener(
          "focusout",
          handleFocus,
          true,
        );
      };
    }, [targetWindow, handleTabRemoval]);

    useEffect(() => {
      if (!tabstripRef.current) return;

      let raf: number | null = null;
      let sawTabRemoval = false;
      const isTabRemoval = (nodes: NodeList) => {
        return Array.from(nodes).some((node) => {
          if (!(node instanceof Element)) return false;

          return (
            node.matches("[data-overflowitem], [role='tab']") ||
            node.querySelector("[data-overflowitem], [role='tab']") !== null
          );
        });
      };

      const observerCallback: MutationCallback = (records) => {
        if (records.some((record) => isTabRemoval(record.removedNodes))) {
          sawTabRemoval = true;
          pendingRemovalRecoveryRef.current = true;
          pendingRemovalRecoveryRetriesRef.current = 0;
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
        observeTarget(targetWindow?.document.body ?? null);
      }

      return () => {
        if (raf != null) {
          cancelAnimationFrame(raf);
        }
        observers.forEach((observer) => observer.disconnect());
      };
    }, [sortItems, handleTabRemoval, menuOpen, targetWindow]);

    const warningId = useId();

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
        aria-describedby={clsx(ariaDescribedBy, warningId) || undefined}
        {...rest}
      >
        {!isMeasuring && hidden.length > 0 && (
          <span id={warningId} className={withBaseName("overflowWarning")}>
            Note: This tab list includes overflow; tab positions may be
            inaccurate or change when a tab is selected
          </span>
        )}
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

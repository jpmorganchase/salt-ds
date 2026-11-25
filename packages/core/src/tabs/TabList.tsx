import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
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
import { useAriaAnnouncer } from "../aria-announcer";
import {
  capitalize,
  makePrefixer,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "../utils";
import { TabListLayoutContext } from "./internal/contexts/TabListLayoutContext";
import { TabSlotRegistryContext } from "./internal/contexts/TabSlotRegistryContext";
import { useTabs } from "./internal/contexts/TabsContext";
import { useFocusWithRetry } from "./internal/hooks/useFocusWithRetry";
import { useTabListRecovery } from "./internal/hooks/useTabListRecovery";
import { useTabRemovalHandler } from "./internal/hooks/useTabRemovalHandler";
import { useTabSelectionFocus } from "./internal/hooks/useTabSelectionFocus";
import { TabOverflowList } from "./internal/overflow/TabOverflowList";
import { TabSlot } from "./internal/overflow/TabSlot";
import { useOverflow } from "./internal/overflow/useOverflow";
import { useOverflowLayoutState } from "./internal/overflow/useOverflowLayoutState";
import tabListCss from "./TabList.css";

const withBaseName = makePrefixer("saltTabList");
const MAX_FOCUS_RETRY_ATTEMPTS = 120;

export interface TabListProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * Styling variant for the background color of the selected tab. Only applies when `appearance` is `"bordered"`.
   * @default "primary"
   */
  activeColor?: "primary" | "secondary" | "tertiary";
  /**
   * The appearance of the tabs.
   * @default "bordered"
   */
  appearance?: "bordered" | "transparent";
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(
  function TabList(props, ref) {
    const {
      appearance = "bordered",
      activeColor = "primary",
      children,
      className,
      onBlurCapture,
      onFocusCapture,
      onKeyDown,
      onPointerDownCapture,
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tab-list",
      css: tabListCss,
      window: targetWindow,
    });

    const {
      renderMode,
      selected,
      setSelected,
      setBootstrapOverflowReady,
      getNext,
      getPrevious,
      getFirst,
      getLast,
      getIndex,
      item,
      itemAt,
      activeTab,
      selectionFromOverflowValueRef,
      menuOpen,
      setMenuOpen,
      sortItems,
      getRemovedItems,
      peekRemovedItems,
      getRenderedTab,
      renderedTabs,
      removalVersion,
    } = useTabs();

    const tabstripRef = useRef<HTMLDivElement>(null);
    const overflowListRef = useRef<HTMLDivElement>(null);
    const slotMapRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const removalRecoveryRafRef = useRef<number | null>(null);
    const pendingRemovalRecoveryRef = useRef(false);
    const pendingRemovalRecoveryRetriesRef = useRef(0);
    // Whether the tabs own focus, so removing the focused tab can recover it.
    // The tab list's React capture handlers set and clear it, not document
    // listeners: Chrome fires a native focusout while removing the focused
    // tab, which looks like an explicit blur, but React doesn't dispatch it
    // for an unmounting tab. Document listeners only clear it when focus or a
    // pointer press moves outside the tabs.
    const focusWithinRef = useRef(false);
    const [slotVersion, setSlotVersion] = useState(0);

    const handleRef = useForkRef(tabstripRef, ref);
    const overflowButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      const doc = targetWindow?.document;
      if (!doc) return;

      const clearOutsideFocusOwnership = (event: Event) => {
        const target = event.target as Node | null;
        if (
          !tabstripRef.current?.contains(target) &&
          !overflowListRef.current?.contains(target)
        ) {
          focusWithinRef.current = false;
        }
      };
      // Also clear pointer ownership in browsers that don't focus buttons.
      doc.addEventListener("focusin", clearOutsideFocusOwnership, true);
      doc.addEventListener("pointerdown", clearOutsideFocusOwnership, true);
      return () => {
        doc.removeEventListener("focusin", clearOutsideFocusOwnership, true);
        doc.removeEventListener(
          "pointerdown",
          clearOutsideFocusOwnership,
          true,
        );
      };
    }, [targetWindow]);

    const { announce } = useAriaAnnouncer();
    const overflowMenuOpen = renderMode === "portal" ? menuOpen : false;

    const [visibleValues, hiddenValues, isMeasuring, isLayoutSettled] =
      useOverflow({
        container: tabstripRef,
        menuOpen: overflowMenuOpen,
        selected,
        tabs: renderedTabs,
        overflowButton: overflowButtonRef,
      });

    useEffect(() => {
      setBootstrapOverflowReady(
        renderMode === "inline" && renderedTabs.length > 0 && !isMeasuring,
      );
    }, [
      isMeasuring,
      renderMode,
      renderedTabs.length,
      setBootstrapOverflowReady,
    ]);

    const exitOverflowMenu = useCallback(() => {
      setMenuOpen(false);

      const focusOverflowButton = () =>
        overflowButtonRef.current?.focus({ preventScroll: true });
      if (targetWindow?.requestAnimationFrame) {
        targetWindow.requestAnimationFrame(focusOverflowButton);
      } else {
        queueMicrotask(focusOverflowButton);
      }
    }, [setMenuOpen, targetWindow]);

    const { resolvedOverflowActiveValue, tabListLayoutContext } =
      useOverflowLayoutState({
        exitOverflowMenu,
        hiddenValues,
        menuOpen,
        overflowMenuOpen,
        visibleValues,
      });
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
      if (renderMode !== "portal") {
        return;
      }

      for (const [value, slotId] of slotAssignments.map) {
        const host = getRenderedTab(value)?.host;
        const slot = slotMapRef.current.get(slotId);

        if (host && slot && host.parentElement !== slot) {
          slot.appendChild(host);
        }
      }
    }, [getRenderedTab, renderMode, slotAssignments]);

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

    const getSelectedTabElement = useCallback(() => {
      return (
        tabstripRef.current?.querySelector<HTMLElement>(
          '[role="tab"][aria-selected="true"]',
        ) ?? item(activeTab.current?.id)?.element
      );
    }, [item, activeTab]);
    const { focusElementWithRetry } = useFocusWithRetry({
      maxAttempts: MAX_FOCUS_RETRY_ATTEMPTS,
      targetWindow,
    });
    useTabSelectionFocus({
      announce,
      focusElementWithRetry,
      focusWithinRef,
      getRenderedTab,
      getSelectedTabElement,
      menuOpen,
      resolvedOverflowActiveValue,
      selected,
      selectionFromOverflowValueRef,
      targetWindow,
    });

    const handleTabRemoval = useTabRemovalHandler({
      activeTab,
      focusElementWithRetry,
      focusWithinRef,
      getFirst,
      getIndex,
      getLast,
      getRemovedItems,
      getRenderedTab,
      getSelectedTabElement,
      isLayoutSettled,
      item,
      itemAt,
      maxRetryAttempts: MAX_FOCUS_RETRY_ATTEMPTS,
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
        data-ismeasuring={
          renderMode === "portal" && isMeasuring ? true : undefined
        }
        ref={handleRef}
        onBlurCapture={(event) => {
          // Window blur leaves the active element in place. An explicit blur
          // to the body, unlike removing the focused tab, clears ownership.
          if (
            event.target !== event.currentTarget.ownerDocument.activeElement
          ) {
            focusWithinRef.current = false;
          }
          onBlurCapture?.(event);
        }}
        onFocusCapture={(event) => {
          // React focus events include the portaled overflow menu.
          focusWithinRef.current = true;
          onFocusCapture?.(event);
        }}
        onKeyDown={handleKeyDown}
        onPointerDownCapture={(event) => {
          // Safari doesn't focus buttons on click, but dismissing a tab with
          // the pointer still gives the tabs ownership of focus recovery.
          focusWithinRef.current = true;
          onPointerDownCapture?.(event);
        }}
        {...rest}
      >
        {renderMode === "inline" ? (
          children
        ) : (
          <TabSlotRegistryContext.Provider value={slotRegistryContext}>
            <TabListLayoutContext.Provider value={tabListLayoutContext}>
              {children}
              {visibleValues.map((value) => (
                <TabSlot key={value} slotId={`main:${value}`} value={value} />
              ))}
              {!menuOpen && hiddenValues.length > 0 ? (
                <div
                  aria-hidden="true"
                  role="presentation"
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
                buttonRef={overflowButtonRef}
                hiddenValues={hiddenValues}
                open={menuOpen}
                order={renderedTabs.length}
                setOpen={setMenuOpen}
                ref={overflowListRef}
              />
            </TabListLayoutContext.Provider>
          </TabSlotRegistryContext.Provider>
        )}
      </div>
    );
  },
);

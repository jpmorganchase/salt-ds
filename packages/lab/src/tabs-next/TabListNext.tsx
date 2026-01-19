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

      // If focus was lost due to deletion, the focus will be on the document body.
      if (doc.activeElement !== doc.body) return;

      if (!activeTab.current) return;

      const removedItems = getRemovedItems();
      const removed = removedItems.get(activeTab.current.id);
      if (!removed) return;

      const removedWasSelected = removed.value === selected;
      const baseIndex = removed.staleIndex ?? -1;

      const restoreFocus = () => {
        if (doc.activeElement !== doc.body) return;

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

        requestAnimationFrame(() => nextTab?.element?.focus());
      };

      requestAnimationFrame(() => requestAnimationFrame(() => restoreFocus()));
    });

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
      const observer = new MutationObserver(() => {
        if (raf != null) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          raf = null;
          sortItems();
        });
      });

      observer.observe(tabstripRef.current, { childList: true });

      return () => {
        if (raf != null) {
          cancelAnimationFrame(raf);
        }
        observer.disconnect();
      };
    }, [sortItems]);

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

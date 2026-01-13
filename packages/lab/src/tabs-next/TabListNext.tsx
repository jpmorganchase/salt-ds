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
    } = useTabsNext();

    const tabstripRef = useRef<HTMLDivElement>(null);
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
      if (targetWindow?.document.activeElement !== targetWindow?.document.body)
        return;
      if (!activeTab.current) return;

      const currentTabIsSelected = activeTab.current?.value === selected;
      const currentTab = item(activeTab.current.id);
      if (!currentTab?.stale) return;
      const nextIndex = currentTab.staleIndex ?? -1;

      setTimeout(() => {
        let nextTab = itemAt(nextIndex) ?? getLast();

        if (nextTab?.element === overflowButtonRef.current) {
          nextTab = itemAt(nextIndex - 1);
        }

        if (nextTab) {
          if (
            currentTabIsSelected &&
            !tabstripRef.current?.querySelector(
              '[role="tab"][aria-selected="true"]',
            )
          ) {
            nextTab.element?.click();
            nextTab.element?.focus();
          } else {
            nextTab.element?.focus();
          }
        }
      }, 166);
    });

    useEffect(() => {
      const handleFocus = () => {
        if (!tabstripRef.current) return;

        // Defer until after React's layout-effect cleanup.
        setTimeout(() => {
          handleTabRemoval();
        }, 0);
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
      const observer = new MutationObserver(() => {
        sortItems();
      });

      if (!tabstripRef.current) return;

      observer.observe(tabstripRef.current, { childList: true });

      return () => {
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
        >
          {hidden}
        </TabOverflowList>
      </div>
    );
  },
);

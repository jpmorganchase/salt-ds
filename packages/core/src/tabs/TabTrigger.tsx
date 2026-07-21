import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
} from "react";
import { makePrefixer, useForkRef, useIsomorphicLayoutEffect } from "../utils";
import { useTab } from "./internal/contexts/TabContext";
import { useTabListLayout } from "./internal/contexts/TabListLayoutContext";
import { useTabs } from "./internal/contexts/TabsContext";
import tabTriggerCss from "./TabTrigger.css";

export interface TabTriggerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "id"> {}

const withBaseName = makePrefixer("saltTabTrigger");

function getAriaDescription(count: number) {
  if (count < 1) {
    return undefined;
  }

  if (count === 1) {
    return "1 action available";
  }

  return `${count} actions available`;
}

const ariaActionSupported =
  typeof HTMLElement !== "undefined" && "ariaActions" in HTMLElement.prototype;

export const TabTrigger = forwardRef<HTMLButtonElement, TabTriggerProps>(
  function TabTrigger(props, ref) {
    const { children, className, onClick, onKeyDown, onFocus, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tab-trigger",
      css: tabTriggerCss,
      window: targetWindow,
    });

    const {
      setSelected,
      registerTab,
      updateTab,
      updateRenderedTab,
      getRenderedTabOrder,
      getPanelId,
      getTabId,
      selected: selectedValue,
      activeTab,
      menuOpen,
      setMenuOpen,
    } = useTabs();
    const { selected, value, focused, disabled, tabId, actions } = useTab();
    const tabListLayout = useTabListLayout();

    const tabRef = useRef<HTMLButtonElement>(null);

    const location = tabListLayout?.getLocation(value) ?? "main";
    const selectionSource = location === "overflow" ? "overflow" : "main";
    const hidden = location === "hidden";
    const overflowOpen = location === "overflow" && menuOpen;
    const renderOrder = getRenderedTabOrder(value);
    const order = renderOrder >= 0 ? renderOrder : undefined;
    const initialLocationRef = useRef(location);
    const initialOrderRef = useRef(order);

    const id = tabId;

    useIsomorphicLayoutEffect(() => {
      if (id && tabRef.current) {
        const item = {
          id,
          value,
          element: tabRef.current,
          location: initialLocationRef.current,
          order: initialOrderRef.current,
        };

        return registerTab(item);
      }
    }, [id, registerTab, value]);

    useIsomorphicLayoutEffect(() => {
      if (!id) {
        return;
      }

      updateTab(id, {
        element: tabRef.current,
        location,
        order,
      });
    }, [id, location, order, updateTab]);

    useIsomorphicLayoutEffect(() => {
      updateRenderedTab(value, {
        trigger: tabRef.current,
      });
    }, [updateRenderedTab, value]);

    useIsomorphicLayoutEffect(() => {
      if (!overflowOpen || tabListLayout?.overflowActiveValue !== value) {
        return;
      }

      tabRef.current?.focus({ preventScroll: true });
    }, [overflowOpen, tabListLayout?.overflowActiveValue, value]);

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      setSelected(event, value, selectionSource);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);

      if (location === "overflow" && event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        setMenuOpen(false);

        const doc = event.currentTarget.ownerDocument;
        const overflowTrigger = doc.querySelector<HTMLElement>(
          "[data-overflowbutton]",
        );
        const scheduleFocus = targetWindow?.requestAnimationFrame;

        if (scheduleFocus) {
          scheduleFocus(() => overflowTrigger?.focus({ preventScroll: true }));
        } else {
          queueMicrotask(() => overflowTrigger?.focus({ preventScroll: true }));
        }

        return;
      }

      if (
        location === "overflow" &&
        tabListLayout &&
        (event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "Home" ||
          event.key === "End")
      ) {
        const moved = tabListLayout.moveOverflowFocus(event.key, value);
        if (moved) {
          event.preventDefault();
          return;
        }
      }

      if (disabled) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
        }
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setSelected(event, value, selectionSource);
      }
    };

    const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
      onFocus?.(event);

      if (id) {
        activeTab.current = { value, id };
      }

      if (location === "overflow") {
        tabListLayout?.setOverflowActiveValue(value);
      }

      // Ensures the associated tab is in view.
      event.currentTarget.parentElement?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    };

    const handleRef = useForkRef<HTMLButtonElement>(tabRef, ref);
    const panelId = getPanelId(value);

    // Applying aria-actions this way avoids React warnings about unknown props
    const ariaActionsProps = ariaActionSupported
      ? {
          "aria-actions": clsx(actions) || undefined,
        }
      : {};

    const active =
      location === "overflow" && tabListLayout?.overflowActiveValue === value;
    const hasSelectedTab =
      selectedValue !== undefined && getTabId(selectedValue) != null;
    const fallbackTabStop =
      !hasSelectedTab && location === "main" && order === 0;
    const isTabStop =
      !hidden && (focused || selected || active || fallbackTabStop);
    const shouldHandleKeyDown = location === "overflow" || !disabled;

    return (
      <button
        aria-selected={selected}
        aria-disabled={disabled}
        aria-controls={panelId}
        {...ariaActionsProps}
        aria-description={getAriaDescription(actions.length)}
        tabIndex={isTabStop ? 0 : -1}
        role="tab"
        type="button"
        onClick={!disabled ? handleClick : undefined}
        onKeyDown={shouldHandleKeyDown ? handleKeyDown : undefined}
        onFocus={handleFocus}
        className={clsx(withBaseName(), className)}
        id={id}
        ref={handleRef}
        data-value={value}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

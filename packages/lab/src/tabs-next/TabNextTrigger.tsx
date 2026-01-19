import { useListItem } from "@floating-ui/react";
import {
  makePrefixer,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
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
import { useTabNext } from "./TabNextContext";
import tabTriggerCss from "./TabNextTrigger.css";
import { useTabOverflow } from "./TabOverflowContext";
import { useTabsNext } from "./TabsNextContext";

export interface TabNextTriggerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "id"> {}

const withBaseName = makePrefixer("saltTabNextTrigger");

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

export const TabNextTrigger = forwardRef<
  HTMLButtonElement,
  TabNextTriggerProps
>(function TabNextTrigger(props, ref) {
  const { children, onClick, onKeyDown, onFocus, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-next-trigger",
    css: tabTriggerCss,
    window: targetWindow,
  });

  const { setSelected, registerTab, getPanelId } = useTabsNext();
  const { selected, value, focused, disabled, tabId, actions } = useTabNext();
  const overflowContext = useTabOverflow();
  const item = useListItem();

  const tabRef = useRef<HTMLButtonElement>(null);

  const id = tabId;

  useIsomorphicLayoutEffect(() => {
    if (value && id && tabRef.current) {
      return registerTab({ id, value, element: tabRef.current });
    }
  }, [value, id, registerTab]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    setSelected(event, value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);

    if (event.key === "Enter" || event.key === " ") {
      setSelected(event, value);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);

    // Ensures the associated tab in in view.
    event.currentTarget.parentElement?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  };

  const handleTabRef = useForkRef<HTMLButtonElement>(item.ref, tabRef);
  const handleRef = useForkRef<HTMLButtonElement>(handleTabRef, ref);
  const panelId = getPanelId(value);

  // Applying aria-actions this way avoid React warnings about unknown props
  const ariaActionsProps = ariaActionSupported
    ? {
        "aria-actions": clsx(actions) || undefined,
      }
    : {};

  const active = overflowContext && item.index === overflowContext?.activeIndex;

  return (
    <button
      aria-selected={selected}
      aria-disabled={disabled}
      aria-controls={panelId}
      {...ariaActionsProps}
      aria-description={getAriaDescription(actions.length)}
      tabIndex={focused || selected || active ? 0 : -1}
      role="tab"
      type="button"
      onClick={!disabled ? handleClick : undefined}
      onKeyDown={!disabled ? handleKeyDown : undefined}
      onFocus={handleFocus}
      className={withBaseName()}
      id={id}
      ref={handleRef}
      data-value={value}
      {...rest}
    >
      {children}
    </button>
  );
});

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
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  useRef,
} from "react";
import { useTabNext } from "./TabNextContext";
import tabTriggerCss from "./TabNextTrigger.css";
import { useTabsNext } from "./TabsNextContext";

export interface TabNextTriggerProps
  extends ComponentPropsWithoutRef<"button"> {}

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
  const { children, id: idProp, onClick, onKeyDown, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-next-trigger",
    css: tabTriggerCss,
    window: targetWindow,
  });

  const { setSelected, registerTab, getPanelId } = useTabsNext();
  const { selected, value, focused, disabled, tabId, actions } = useTabNext();

  const tabRef = useRef<HTMLButtonElement>(null);

  const id = tabId;

  useIsomorphicLayoutEffect(() => {
    if (value && id && tabRef.current) {
      return registerTab({ id, value, element: tabRef.current });
    }
  }, [value, id, registerTab]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setSelected(event, value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);

    if (event.key === "Enter" || event.key === " ") {
      setSelected(event, value);
    }
  };

  const handleRef = useForkRef<HTMLButtonElement>(tabRef, ref);
  const panelId = getPanelId(value);

  const ariaActionsProps = ariaActionSupported
    ? {
        "aria-actions": clsx(actions) || undefined,
      }
    : {};

  return (
    <button
      aria-selected={selected}
      aria-disabled={disabled}
      aria-controls={panelId}
      {...ariaActionsProps}
      aria-description={getAriaDescription(actions.length)}
      tabIndex={focused || selected ? undefined : -1}
      role="tab"
      type="button"
      onClick={!disabled ? handleClick : undefined}
      onKeyDown={!disabled ? handleKeyDown : undefined}
      className={withBaseName()}
      id={id}
      ref={handleRef}
      {...rest}
    >
      {children}
    </button>
  );
});

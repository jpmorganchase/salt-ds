import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { useTabNext } from "./TabNextContext";
import tabTriggerCss from "./TabNextTrigger.css";
import { useTabsNext } from "./TabsNextContext";

export interface TabNextTriggerProps
  extends ComponentPropsWithoutRef<"button"> {}

const withBaseName = makePrefixer("saltTabNextTrigger");

export const TabNextTrigger = forwardRef<
  HTMLButtonElement,
  TabNextTriggerProps
>(function TabNextTrigger(props, ref) {
  const { children, id: idProp, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-next-trigger",
    css: tabTriggerCss,
    window: targetWindow,
  });

  const { setSelected, registerTab, getPanelId } = useTabsNext();
  const { selected, value, focused, disabled, tabId } = useTabNext();

  const tabRef = useRef<HTMLButtonElement>(null);

  const id = tabId;

  useEffect(() => {
    if (value && id && tabRef.current) {
      return registerTab({ id, value, element: tabRef.current });
    }
  }, [value, id, registerTab]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!id) return;
    setSelected(event, id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (id && (event.key === "Enter" || event.key === " ")) {
      setSelected(event, id);
    }
  };

  const handleRef = useForkRef<HTMLButtonElement>(tabRef, ref);
  const panelId = getPanelId(value);

  return (
    <button
      aria-selected={selected}
      aria-disabled={disabled}
      aria-controls={panelId}
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

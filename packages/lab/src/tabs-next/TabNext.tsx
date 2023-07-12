import { makePrefixer } from "@salt-ds/core";
import {
  forwardRef,
  ReactElement,
  ComponentPropsWithoutRef,
  MouseEvent,
  FocusEvent,
  useEffect,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tabCss from "./TabNext.css";
import clsx from "clsx";
import { OverflowItem } from "@fluentui/react-overflow";
import { useTabs } from "./TabNextContext";

const withBaseName = makePrefixer("saltTabNext");

export interface TabNextProps extends ComponentPropsWithoutRef<"button"> {
  /* Value prop is mandatory and must be unique in order for overflow to work. */
  value: string;
}

export const TabNext = forwardRef<HTMLButtonElement, TabNextProps>(function Tab(
  props,
  ref
): ReactElement<TabNextProps> {
  const {
    children,
    className,
    disabled: disabledProp,
    onClick,
    onFocus,
    value,
    ...rest
  } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tab-next",
    css: tabCss,
    window: targetWindow,
  });
  const {
    isSelected,
    select,
    isFocusable,
    setFocusable,
    disabled: tabstripDisabled,
    unregisterTab,
    registerTab,
  } = useTabs();
  const selected = isSelected(value);
  const focusable = isFocusable(value);
  const disabled = tabstripDisabled || disabledProp;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    select(event);
    onClick?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    setFocusable(value);
    onFocus?.(event);
  };

  useEffect(() => {
    registerTab({ value, label: children });
    return () => unregisterTab(value);
  }, [children, registerTab, unregisterTab, value]);

  return (
    <OverflowItem id={value} priority={selected ? 2 : 1}>
      <div className={withBaseName("wrapper")}>
        <button
          className={clsx(withBaseName(), className)}
          data-value={value}
          aria-selected={selected}
          disabled={disabled}
          value={value}
          ref={ref}
          role="tab"
          onClick={handleClick}
          onFocus={handleFocus}
          tabIndex={focusable && !disabled ? 0 : -1}
          {...rest}
        >
          <span className={withBaseName("label")}>{children}</span>
        </button>
      </div>
    </OverflowItem>
  );
});

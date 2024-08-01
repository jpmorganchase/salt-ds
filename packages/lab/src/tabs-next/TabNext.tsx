import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  forwardRef,
  useEffect,
} from "react";

import { OverflowItem } from "@fluentui/react-overflow";
import clsx from "clsx";
import tabCss from "./TabNext.css";
import { useTabs } from "./TabNextContext";

const withBaseName = makePrefixer("saltTabNext");

export interface TabNextProps extends ComponentPropsWithoutRef<"button"> {
  /* Value prop is mandatory and must be unique in order for overflow to work. */
  value: string;
}

export const TabNext = forwardRef<HTMLButtonElement, TabNextProps>(
  function Tab(props, ref): ReactElement<TabNextProps> {
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
      activeColor,
      isActive,
      activate,
      isFocusable,
      setFocusable,
      disabled: tabstripDisabled,
      unregisterTab,
      registerTab,
      variant,
    } = useTabs();
    const active = isActive(value);
    const focusable = isFocusable(value);
    const disabled = tabstripDisabled || disabledProp;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      activate(event);
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
      <OverflowItem id={value} priority={active ? 2 : 1}>
        <div className={withBaseName("wrapper")}>
          <button
            className={clsx(
              withBaseName(),
              withBaseName(variant),
              withBaseName(activeColor),
              className,
            )}
            data-value={value}
            aria-selected={active}
            disabled={disabled}
            value={value}
            ref={ref}
            role="tab"
            onClick={handleClick}
            onFocus={handleFocus}
            tabIndex={focusable && !disabled ? 0 : -1}
            type="button"
            {...rest}
          >
            {children}
          </button>
        </div>
      </OverflowItem>
    );
  },
);

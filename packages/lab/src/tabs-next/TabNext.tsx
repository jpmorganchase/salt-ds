import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import {
  forwardRef,
  ReactElement,
  ComponentPropsWithoutRef,
  useEffect,
  useRef,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tabCss from "./TabNext.css";
import clsx from "clsx";
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
    disabled: tabstripDisabled,
    registerItem,
    variant,
    setSelected,
    selected,
    active,
  } = useTabs();
  const disabled = tabstripDisabled || disabledProp;

  const tabRef = useRef<HTMLButtonElement>(null);
  const handleRef = useForkRef(ref, tabRef);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    setSelected(value);
  };

  useEffect(() => {
    return registerItem({ id: value, element: tabRef.current });
  }, [value]);

  return (
    <button
      className={clsx(withBaseName(), withBaseName(variant), className)}
      data-value={value}
      aria-selected={selected === value || undefined}
      disabled={disabled}
      tabIndex={active === value ? 0 : -1}
      value={value}
      ref={handleRef}
      role="tab"
      type="button"
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
});

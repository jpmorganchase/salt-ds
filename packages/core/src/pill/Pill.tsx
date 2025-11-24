import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  useState,
} from "react";
import { useButton } from "../button";
import { makePrefixer } from "../utils";
import pillCss from "./Pill.css";
import { PillCheckIcon } from "./PillCheckIcon";
import { usePillGroup } from "./PillGroupContext";

const withBaseName = makePrefixer("saltPill");

export interface PillProps extends ComponentPropsWithoutRef<"button"> {
  value?: string;
}

export const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill(
  {
    children,
    className,
    disabled: disabledProp,
    onKeyUp,
    onKeyDown,
    onClick,
    onFocus,
    onBlur,
    value,
    ...rest
  },
  ref,
) {
  const pillGroupContext = usePillGroup();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill",
    css: pillCss,
    window: targetWindow,
  });
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (pillGroupContext && value) {
      pillGroupContext.select(event, value);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(event);
    setFocused(true);
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    setFocused(false);
  };

  const { buttonProps, active } = useButton<HTMLButtonElement>({
    disabled: disabledProp,
    onKeyUp,
    onKeyDown,
    onClick: handleClick,
    onBlur: handleBlur,
  });
  // we do not want to spread tab index in this case because the button element
  // does not require tabindex="0" attribute
  const {
    tabIndex: _tabIndex,
    disabled: buttonDisabled,
    ...restButtonProps
  } = buttonProps;

  const [focused, setFocused] = useState(false);

  const selected = !!value && pillGroupContext?.selected.includes(value);
  const disabled = pillGroupContext?.disabled || disabledProp || buttonDisabled;

  let tabIndex: undefined | number;

  if (pillGroupContext) {
    if (pillGroupContext.focusInside) {
      tabIndex = focused ? undefined : -1;
    } else {
      tabIndex =
        pillGroupContext.selected.length > 0 && !selected ? -1 : undefined;
    }
  }

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: Option role applied when aria-checked
    <button
      data-testid="pill"
      ref={ref}
      className={clsx(
        withBaseName(),
        withBaseName("clickable"),
        { [withBaseName("active")]: active },
        className,
      )}
      type={pillGroupContext ? undefined : "button"}
      aria-checked={
        pillGroupContext && value
          ? pillGroupContext.selected.includes(value)
          : undefined
      }
      tabIndex={tabIndex}
      role={pillGroupContext ? "option" : undefined}
      onFocus={handleFocus}
      disabled={disabled}
      {...restButtonProps}
      {...rest}
    >
      {pillGroupContext && <PillCheckIcon checked={selected} active={active} />}
      {children}
    </button>
  );
});

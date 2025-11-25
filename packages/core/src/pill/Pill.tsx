import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  useEffect,
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
  const [pressActive, setPressActive] = useState(false);
  const [focused, setFocused] = useState(false);

  const pillGroupContext = usePillGroup();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill",
    css: pillCss,
    window: targetWindow,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (pillGroupContext && value) {
      pillGroupContext.select(event, value);
    }
    onClick?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  const handlePointerDown = () => {
    if (disabledProp) return;
    setPressActive(true);
  };

  useEffect(() => {
    const clear = () => setPressActive(false);
    window.addEventListener("pointerup", clear);
    window.addEventListener("pointercancel", clear);
    return () => {
      window.removeEventListener("pointerup", clear);
      window.removeEventListener("pointercancel", clear);
    };
  }, []);

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

  const combinedActive = pressActive || active;

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: Option role applied when aria-checked
    <button
      data-testid="pill"
      ref={ref}
      className={clsx(
        withBaseName(),
        withBaseName("clickable"),
        { [withBaseName("active")]: combinedActive },
        className,
      )}
      type="button"
      aria-checked={
        pillGroupContext && value
          ? pillGroupContext.selected.includes(value)
          : undefined
      }
      tabIndex={tabIndex}
      role={pillGroupContext ? "option" : undefined}
      onFocus={handleFocus}
      onPointerDown={handlePointerDown}
      disabled={disabled}
      {...restButtonProps}
      {...rest}
    >
      {pillGroupContext && (
        <PillCheckIcon checked={selected} active={combinedActive} />
      )}
      {children}
    </button>
  );
});

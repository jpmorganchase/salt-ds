import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
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
    onPointerDown,
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

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    if (disabledProp) return;
    setPressActive(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key === "Enter") {
      // Prevent selection on enter key.
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (!targetWindow) return;

    const clear = () => setPressActive(false);
    targetWindow.addEventListener("pointerup", clear);
    targetWindow.addEventListener("pointercancel", clear);
    return () => {
      targetWindow.removeEventListener("pointerup", clear);
      targetWindow.removeEventListener("pointercancel", clear);
    };
  }, [targetWindow]);

  const { buttonProps, active } = useButton<HTMLButtonElement>({
    disabled: disabledProp,
    onKeyUp,
    onKeyDown: handleKeyDown,
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

  const insideGroup = !!pillGroupContext;

  const selected = !!value && pillGroupContext?.selected.includes(value);
  const disabled = pillGroupContext?.disabled || buttonDisabled;

  let tabIndex: undefined | number;

  if (pillGroupContext) {
    const { focusInside: groupHasFocus, selected: selectedPills } =
      pillGroupContext;

    const nonTabbable =
      (groupHasFocus && !focused) || (selectedPills.length > 0 && !selected);

    tabIndex = nonTabbable ? -1 : undefined;
  }

  const combinedActive = pressActive || active;

  const groupProps: ComponentPropsWithoutRef<"button"> = insideGroup
    ? {
        "aria-selected": selected,
        "aria-checked": selected,
        role: "option",
      }
    : {};

  return (
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
      tabIndex={tabIndex}
      onFocus={handleFocus}
      onPointerDown={handlePointerDown}
      disabled={disabled}
      {...restButtonProps}
      {...groupProps}
      {...rest}
    >
      {insideGroup && (
        <PillCheckIcon checked={selected} active={combinedActive} />
      )}
      {children}
    </button>
  );
});

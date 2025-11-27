import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
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
    onBlur,
    onPointerDown,
    value,
    ...rest
  },
  ref,
) {
  const [pressActive, setPressActive] = useState(false);
  const [spaceActive, setSpaceActive] = useState(false);

  const pillGroupContext = usePillGroup();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-pill",
    css: pillCss,
    window: targetWindow,
  });

  const insideSelectableGroup =
    pillGroupContext.selectionVariant === "multiple";

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (insideSelectableGroup && value) {
      pillGroupContext.select(event, value);
    }
    onClick?.(event);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    if (disabledProp) return;
    setPressActive(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.key === "Enter" && insideSelectableGroup) {
      // Prevent selection on enter key for selectable pill.
      event.preventDefault();
      return;
    }
    if (event.key === " " && insideSelectableGroup) {
      setSpaceActive(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyUp?.(event);
    if (insideSelectableGroup && event.key === " ") {
      setSpaceActive(false);
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
    onKeyUp: handleKeyUp,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
    onBlur,
  });
  // we do not want to spread tab index in this case because the button element
  // does not require tabindex="0" attribute
  const {
    tabIndex: _tabIndex,
    disabled: buttonDisabled,
    ...restButtonProps
  } = buttonProps;

  const selected =
    !!value &&
    insideSelectableGroup &&
    pillGroupContext.selected.includes(value);
  const disabled = pillGroupContext.disabled || buttonDisabled;

  // Prevents selectable pill being active on Enter key press
  const combinedActive = insideSelectableGroup
    ? pressActive || spaceActive
    : pressActive || active;

  const groupProps: ComponentPropsWithoutRef<"button"> = insideSelectableGroup
    ? {
        "aria-checked": selected,
        role: "checkbox",
        value
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
      onPointerDown={handlePointerDown}
      disabled={disabled}
      {...restButtonProps}
      {...groupProps}
      {...rest}
    >
      {insideSelectableGroup && (
        <PillCheckIcon checked={selected} active={combinedActive} />
      )}
      {children}
    </button>
  );
});

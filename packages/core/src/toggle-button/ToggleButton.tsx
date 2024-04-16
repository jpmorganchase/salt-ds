import {
  forwardRef,
  useRef,
  MouseEvent,
  FocusEvent,
  ComponentPropsWithoutRef,
} from "react";
import { clsx } from "clsx";
import { useToggleButtonGroup } from "../toggle-button-group";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useControlled, useForkRef } from "../utils";

import toggleButtonCss from "./ToggleButton.css";

export interface ToggleButtonProps extends ComponentPropsWithoutRef<"button"> {
  selected?: boolean;
  onChange?: (event: MouseEvent<HTMLButtonElement>) => void;
  value: string | ReadonlyArray<string> | number | undefined;
}

const withBaseName = makePrefixer("saltToggleButton");

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(props, ref) {
    const {
      children,
      className,
      disabled: disabledProp,
      value,
      onClick,
      onFocus,
      onChange,
      selected: selectedProp,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toggle-button",
      css: toggleButtonCss,
      window: targetWindow,
    });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const handleRef = useForkRef(ref, buttonRef);

    const toggleButtonGroup = useToggleButtonGroup();

    const toggleButtonGroupSelected = toggleButtonGroup
      ? toggleButtonGroup.isSelected(value)
      : selectedProp;
    const focusable = toggleButtonGroup
      ? toggleButtonGroup?.isFocused(value)
      : true;
    const disabled = toggleButtonGroup?.disabled || disabledProp;

    const [selected, setSelected] = useControlled({
      controlled: toggleButtonGroupSelected,
      default: Boolean(selectedProp),
      name: "ToggleButton",
      state: "selected",
    });

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      toggleButtonGroup?.select(event);
      setSelected(!selected);
      onChange?.(event);
      onClick?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
      toggleButtonGroup?.focus(value);
      onFocus?.(event);
    };

    const ariaChecked = selected && !disabled;

    return (
      <button
        aria-pressed={!toggleButtonGroup ? ariaChecked : undefined}
        aria-checked={toggleButtonGroup ? ariaChecked : undefined}
        role={toggleButtonGroup ? "radio" : undefined}
        className={clsx(withBaseName(), className)}
        disabled={disabled}
        ref={handleRef}
        onClick={handleClick}
        onFocus={handleFocus}
        tabIndex={focusable && !disabled ? 0 : -1}
        value={value}
        type="button"
        {...rest}
      >
        {children}
      </button>
    );
  }
);

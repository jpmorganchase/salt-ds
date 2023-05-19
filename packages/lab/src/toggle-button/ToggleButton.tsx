import {
  ComponentProps,
  forwardRef,
  useRef,
  MouseEvent,
  FocusEvent,
} from "react";
import { makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useToggleButtonGroup } from "../toggle-button-group";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toggleButtonCss from "./ToggleButton.css";

export interface ToggleButtonProps extends ComponentProps<"button"> {
  selected?: boolean;
  onSelectionChange?: (event: MouseEvent<HTMLButtonElement>) => void;
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
      onSelectionChange,
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
    const focused = toggleButtonGroup?.isFocused(value);
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
      onSelectionChange?.(event);
      onClick?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
      toggleButtonGroup?.focus(value);
      onFocus?.(event);
    };

    return (
      <button
        aria-checked={selected}
        className={clsx(withBaseName(), className)}
        disabled={disabled}
        role={toggleButtonGroup ? "radio" : "checkbox"}
        ref={handleRef}
        onClick={handleClick}
        onFocus={handleFocus}
        tabIndex={focused && !disabled ? 0 : -1}
        value={value}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

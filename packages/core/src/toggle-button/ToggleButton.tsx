import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
  forwardRef,
  useRef,
} from "react";
import type { ButtonAppearance, ButtonSentiment } from "../button";
import { useToggleButtonGroup } from "../toggle-button-group";
import { makePrefixer, useControlled, useForkRef } from "../utils";

import toggleButtonCss from "./ToggleButton.css";

export interface ToggleButtonProps extends ComponentPropsWithoutRef<"button"> {
  selected?: boolean;
  onChange?: (event: MouseEvent<HTMLButtonElement>) => void;
  value: string | ReadonlyArray<string> | number | undefined;
  sentiment?: ButtonSentiment;
  appearance?: Extract<ButtonAppearance, "bordered" | "solid">;
}

const withBaseName = makePrefixer("saltToggleButton");

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(props, ref) {
    const {
      appearance = "solid",
      children,
      className,
      disabled: disabledProp,
      value,
      onClick,
      onFocus,
      onChange,
      selected: selectedProp,
      sentiment = "neutral",
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
      if (disabled) {
        return;
      }
      toggleButtonGroup?.select(event);
      setSelected(!selected);
      onChange?.(event);
      onClick?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
      toggleButtonGroup?.focus(value);
      onFocus?.(event);
    };

    return (
      <button
        aria-pressed={!toggleButtonGroup ? selected : undefined}
        aria-checked={toggleButtonGroup ? selected : undefined}
        role={toggleButtonGroup ? "radio" : undefined}
        className={clsx(
          withBaseName(),
          withBaseName(sentiment),
          withBaseName(appearance),
          className,
        )}
        aria-disabled={disabled}
        ref={handleRef}
        onClick={handleClick}
        onFocus={handleFocus}
        tabIndex={focusable ? 0 : -1}
        value={value}
        type="button"
        {...rest}
      >
        {children}
      </button>
    );
  },
);

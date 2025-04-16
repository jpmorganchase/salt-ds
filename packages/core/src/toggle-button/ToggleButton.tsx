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
  /**
   * The appearance of the toggle button.
   * @default solid
   */
  appearance?: Extract<ButtonAppearance, "bordered" | "solid">;
  /**
   * Callback fired when the toggle button's selection state is changed.
   */
  onChange?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * The sentiment of the toggle button.
   * @default neutral
   */
  sentiment?: ButtonSentiment;
  /**
   * Whether the toggle button is a selected state.
   */
  selected?: boolean;
  /**
   * Value of the toggle button, to be used when in a controlled state.
   */
  value: string | ReadonlyArray<string> | number | undefined;
}

const withBaseName = makePrefixer("saltToggleButton");

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(props, ref) {
    const {
      appearance: appearanceProp = "solid",
      children,
      className,
      disabled: disabledProp,
      value,
      onClick,
      onFocus,
      onChange,
      selected: selectedProp,
      sentiment: sentimenentProp = "neutral",
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

    const toggleButtonProps: ToggleButtonProps = {
      "aria-pressed": !toggleButtonGroup ? selected : undefined,
      "aria-checked": toggleButtonGroup ? selected : undefined,
      "aria-disabled": disabled,
      role: toggleButtonGroup ? "radio" : undefined,
      className: clsx(
        withBaseName(),
        withBaseName(toggleButtonGroup?.sentiment || sentimenentProp),
        withBaseName(toggleButtonGroup?.appearance || appearanceProp),
        className,
      ),
      onClick: handleClick,
      onFocus: handleFocus,
      tabIndex: focusable ? 0 : -1,
      value: value,
      type: "button",
      // Work around to allow disabled selected toggle buttons
      // to be focusable
      ...(!selected && { disabled: disabled }),
      ...rest,
    };

    const toggleButtonBody = (
      <button ref={handleRef} {...toggleButtonProps}>
        {children}
      </button>
    );

    return toggleButtonGroup ? (
      toggleButtonBody
    ) : (
      // Standalone toggle button
      <div
        className={clsx(
          withBaseName("container"),
          disabled && withBaseName("container-disabled"),
        )}
      >
        {toggleButtonBody}
      </div>
    );
  },
);

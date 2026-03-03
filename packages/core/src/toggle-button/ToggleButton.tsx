import {
  useClassNameInjection,
  useComponentCssInjection,
} from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type MouseEvent,
  useRef,
} from "react";
import type { ButtonAppearance, ButtonSentiment } from "../button";
import { useToggleButtonGroup } from "../toggle-button-group";
import { makePrefixer, useControlled, useForkRef } from "../utils";

import toggleButtonCss from "./ToggleButton.css";

export interface ToggleButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * The appearance of the toggle button when `selected` is true.
   * @default solid
   */
  appearance?: Extract<ButtonAppearance, "bordered" | "solid">;
  /**
   * Callback fired when the toggle button's selection state is changed.
   */
  onChange?: (event: MouseEvent<HTMLButtonElement>) => void;
  /**
   * If `true`, the toggle button will be read-only.
   */
  readOnly?: boolean;
  /**
   * The sentiment of the toggle button.
   * @default neutral
   */
  sentiment?: ButtonSentiment;
  /**
   * Whether the toggle button is in a selected state.
   */
  selected?: boolean;
  /**
   * Whether the toggle button is selected by default.
   * This will be disregarded if `selected` is already set.
   */
  defaultSelected?: boolean;
  /**
   * Value of the toggle button, to be used when in a controlled state.
   */
  value: string | ReadonlyArray<string> | number | undefined;
}

const withBaseName = makePrefixer("saltToggleButton");

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(props, ref) {
    const { className, props: finalProps } = useClassNameInjection(
      "saltToggleButton",
      props,
    );
    const {
      appearance: appearanceProp,
      children,
      disabled: disabledProp,
      value,
      onClick,
      onFocus,
      onChange,
      readOnly: readOnlyProp,
      selected: selectedProp,
      defaultSelected,
      sentiment: sentimentProp,
      ...rest
    } = finalProps;

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

    const sentiment =
      sentimentProp || toggleButtonGroup?.sentiment || "neutral";
    const appearance =
      appearanceProp || toggleButtonGroup?.appearance || "solid";
    const disabled = toggleButtonGroup?.disabled || disabledProp;
    const readOnly = toggleButtonGroup?.readOnly || readOnlyProp;

    const [selected, setSelected] = useControlled({
      controlled: toggleButtonGroupSelected,
      default: Boolean(defaultSelected),
      name: "ToggleButton",
      state: "selected",
    });

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled || readOnly) {
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
      "aria-readonly": readOnlyProp,
      "aria-pressed": !toggleButtonGroup ? selected : undefined,
      "aria-checked": toggleButtonGroup ? selected : undefined,
      "aria-disabled": disabled,
      role: toggleButtonGroup ? "radio" : undefined,
      className: clsx(
        withBaseName(),
        withBaseName(sentiment),
        withBaseName(appearance),
        readOnly && withBaseName("readOnly"),
        className,
      ),
      onClick: handleClick,
      onFocus: handleFocus,
      tabIndex: focusable ? 0 : -1,
      value: value,
      type: "button",
      disabled: disabled,
      readOnly: readOnlyProp,
      ...rest,
    };

    return (
      <button ref={handleRef} {...toggleButtonProps}>
        {children}
      </button>
    );
  },
);

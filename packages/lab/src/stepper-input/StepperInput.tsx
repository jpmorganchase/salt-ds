import { clsx } from "clsx";
import { FocusEventHandler, forwardRef, useRef } from "react";
import { Button, makePrefixer, Input, InputProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { TriangleDownIcon, TriangleUpIcon } from "@salt-ds/icons";
import { useStepperInput } from "./useStepperInput";

import stepperInputCss from "./StepperInput.css";

const withBaseName = makePrefixer("saltStepperInput");

export interface StepperInputProps
  extends Omit<InputProps, "onChange" | "emptyReadOnlyMarker"> {
  /**
   * A multiplier applied to the `step` when the value is incremented or decremented using the PageDown/PageUp keys.
   */
  block?: number;
  /**
   * The number of decimal places to display.
   */
  decimalPlaces?: number;
  /**
   * Sets the initial default value of the component.
   */
  defaultValue?: number;
  /**
   * The maximum value that can be selected.
   */
  max?: number;
  /**
   * The minimum value that can be selected.
   */
  min?: number;
  /**
   * Whether to hide the stepper buttons. Defaults to `false`.
   */
  hideButtons?: boolean;
  /**
   * Callback when stepper input loses focus.
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when stepper input value is changed.
   */
  onChange?: (changedValue: number | string) => void;
  /**
   * Callback when stepper input gains focus.
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * The amount to increment or decrement the value by when using the stepper buttons or Up Arrow and Down Arrow keys.
   */
  step?: number;
  /**
   * Determines the text alignment of the display value.
   */
  textAlign?: "center" | "left" | "right";
  /**
   * The value of the stepper input. The component will be controlled if this prop is provided.
   */
  value?: number | string;
}

export const StepperInput = forwardRef<HTMLDivElement, StepperInputProps>(
  function StepperInput(props, ref) {
    const {
      className,
      hideButtons,
      onBlur,
      onChange,
      onFocus,
      readOnly,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stepper-input",
      css: stepperInputCss,
      window: targetWindow,
    });

    const inputRef = useRef<HTMLInputElement | null>(null);

    const { getButtonProps, getInputProps } = useStepperInput(props, inputRef);

    return (
      <div className={clsx(withBaseName(), className)} ref={ref}>
        <Input
          onBlur={onBlur}
          onFocus={onFocus}
          ref={inputRef}
          readOnly={readOnly}
          {...getInputProps(rest)}
        />
        {!hideButtons && !readOnly && (
          <div className={withBaseName("buttonContainer")}>
            <Button
              aria-label="increment value"
              className={withBaseName("stepperButton")}
              {...getButtonProps("increment")}
            >
              <TriangleUpIcon aria-hidden />
            </Button>
            <Button
              aria-label="decrement value"
              className={withBaseName("stepperButton")}
              {...getButtonProps("decrement")}
            >
              <TriangleDownIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

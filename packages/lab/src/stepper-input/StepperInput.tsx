import { clsx } from "clsx";
import {
  ComponentPropsWithoutRef,
  FocusEventHandler,
  forwardRef,
  ReactNode,
  useRef,
} from "react";
import {
  Button,
  ButtonProps,
  makePrefixer,
  Input,
  InputProps,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { RefreshIcon, TriangleDownIcon, TriangleUpIcon } from "@salt-ds/icons";
import { useActivationIndicatorPosition } from "./internal/useActivationIndicatorPosition";
import { useStepperInput } from "./useStepperInput";

import stepperInputCss from "./StepperInput.css";

const withBaseName = makePrefixer("saltStepperInput");

export interface StepperInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * Props to be passed to the button components.
   */
  ButtonProps?: Partial<ButtonProps>;
  /**
   * Props to be passed to the input component.
   */
  InputProps?: Partial<InputProps>;
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
   * Values passed in via the `liveValue` prop are not immediately rendered. Instead, the refresh button is displayed,
offering the user the option to reset the component's display value to the updated `liveValue` prop.
   */
  liveValue?: number;
  /**
   * The maximum value that can be selected.
   */
  max?: number;
  /**
   * The minimum value that can be selected.
   */
  min?: number;
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
   * If `true`, always display the refresh button
   */
  showRefreshButton?: boolean;
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
      ButtonProps: ButtonPropsProp,
      InputProps: InputPropsProp,
      textAlign = "left",
      className,
      showRefreshButton = false,
      onBlur,
      onFocus,
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stepper-input",
      css: stepperInputCss,
      window: targetWindow,
    });

    const adornmentRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const {
      decrementButtonDown,
      getButtonIcon,
      getButtonProps,
      getInputProps,
      incrementButtonDown,
      isAtMax,
      isAtMin,
      refreshCurrentValue,
      stepperDirection,
      valuesHaveDiverged,
    } = useStepperInput(props, inputRef);

    useActivationIndicatorPosition(
      adornmentRef,
      valuesHaveDiverged() || showRefreshButton
    );

    const endAdornment: ReactNode = (
      <>
        <Button
          aria-label="Refresh default value"
          className={clsx({
            // Refresh button is always rendered and has its visibility toggled to
            // avoid component width changing.
            [withBaseName("hideSecondaryButton")]: !(
              showRefreshButton || valuesHaveDiverged()
            ),
          })}
          onClick={refreshCurrentValue}
          variant="secondary"
        >
          <RefreshIcon aria-label="refresh" />
        </Button>

        <Button
          className={clsx({
            active: incrementButtonDown,
          })}
          disabled={isAtMax()}
          {...getButtonProps(stepperDirection.INCREMENT, ButtonPropsProp)}
        >
          <TriangleUpIcon
            aria-label={getButtonIcon(stepperDirection.INCREMENT)}
          />
        </Button>
        <Button
          className={clsx({
            active: decrementButtonDown,
          })}
          disabled={isAtMin()}
          {...getButtonProps(stepperDirection.DECREMENT, ButtonPropsProp)}
        >
          <TriangleDownIcon
            aria-label={getButtonIcon(stepperDirection.DECREMENT)}
          />
        </Button>
      </>
    );

    return (
      <div
        className={clsx(withBaseName(), className)}
        onBlur={onBlur}
        onFocus={onFocus}
        ref={ref}
      >
        <Input
          className={withBaseName("input")}
          endAdornment={endAdornment}
          ref={inputRef}
          textAlign={textAlign}
          {...getInputProps(InputPropsProp)}
        />
      </div>
    );
  }
);

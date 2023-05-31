import { clsx } from "clsx";
import React, { forwardRef, ReactNode, useRef } from "react";
import { Button, ButtonProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { RefreshIcon, TriangleDownIcon, TriangleUpIcon } from "@salt-ds/icons";
import {
  InputLegacy as Input,
  InputLegacyProps as InputProps,
} from "../input-legacy";
import { useActivationIndicatorPosition } from "./internal/useActivationIndicatorPosition";
import { useStepperInput } from "./useStepperInput";

import stepperInputCss from "./StepperInput.css";

const withBaseName = makePrefixer("saltStepperInput");

export interface StepperInputProps {
  ButtonProps?: Partial<ButtonProps>;
  InputProps?: Partial<InputProps>;
  block?: number;
  className?: string;
  decimalPlaces?: number;
  defaultValue?: number;
  liveValue?: number;
  max?: number;
  min?: number;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onChange?: (changedValue: number | string) => void;
  showRefreshButton?: boolean;
  step?: number;
  textAlign?: "center" | "left" | "right";
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
      <div className={withBaseName("adornmentContainer")} ref={adornmentRef}>
        <Button
          aria-label="Refresh default value"
          className={clsx(withBaseName("secondaryButton"), {
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
        <div className={withBaseName("buttonContainer")}>
          <Button
            className={clsx(
              withBaseName("stepperButton"),
              withBaseName("increment"),
              {
                active: incrementButtonDown,
              }
            )}
            disabled={isAtMax()}
            {...getButtonProps(stepperDirection.INCREMENT, ButtonPropsProp)}
          >
            <TriangleUpIcon
              className={withBaseName("stepperButtonIcon")}
              aria-label={getButtonIcon(stepperDirection.INCREMENT)}
            />
          </Button>
          <Button
            className={clsx(
              withBaseName("stepperButton"),
              withBaseName("decrement"),
              {
                active: decrementButtonDown,
              }
            )}
            disabled={isAtMin()}
            {...getButtonProps(stepperDirection.DECREMENT, ButtonPropsProp)}
          >
            <TriangleDownIcon
              className={withBaseName("stepperButtonIcon")}
              aria-label={getButtonIcon(stepperDirection.DECREMENT)}
            />
          </Button>
        </div>
      </div>
    );

    return (
      <div
        className={clsx(withBaseName(), className)}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        ref={ref}
      >
        <Input
          className={withBaseName("input")}
          endAdornment={endAdornment}
          highlightOnFocus
          ref={inputRef}
          textAlign={textAlign}
          {...getInputProps(InputPropsProp)}
        />
      </div>
    );
  }
);

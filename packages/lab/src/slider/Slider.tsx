import {
  type ChangeEvent,
  type HTMLAttributes,
  type SyntheticEvent,
  forwardRef,
} from "react";

import { useControlled, useFormFieldProps } from "@salt-ds/core";
import clsx from "clsx";
import { SliderThumb } from "./internal/SliderThumb";
import { SliderTrack } from "./internal/SliderTrack";
import { useSliderThumb } from "./internal/useSliderThumb";
import { calculatePercentage, clamp, toFloat } from "./internal/utils";

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: number;
  /**
   * Disable the slider
   */
  disabled?: boolean;
  /**
   * A callback to format the display value in the tooltip
   */
  format?: (value: number) => string | number;
  /**
   * Position of the labels
   */
  labelPosition?: "bottom" | "inline";
  /**
   * The markers to show under the slider to label some values
   */
  markers?: { label: string; value: number }[];
  /**
   * Maximum slider value
   */
  max?: number;
  /**
   * Minimum slider value
   */
  min?: number;
  /**
   * Label for maximum value
   */
  maxLabel?: string;
  /**
   * Label for the minimum value
   */
  minLabel?: string;
  /**
   * Callback called when slider value is changed.
   * Event is either an Input change event or a click event.
   */
  onChange?: (event: SyntheticEvent<unknown> | Event, value: number) => void;
  /**
   * Callback called when the slider is stopped from being dragged or
   * its value is changed from the keyboard.
   * Event is either an Input change event or a click event.
   */
  onChangeEnd?: (event: SyntheticEvent<unknown> | Event, value: number) => void;
  /**
   * Minimum interval the slider thumb can move
   */
  step?: number;
  /**
   * Maximum interval the slider thumb can move when using PageUp and PageDown keys
   */
  stepMultiplier?: number;
  /**
   * Value of the slider, to be used when in a controlled state
   */
  value?: number;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-valuetext": ariaValueText,
    defaultValue = 0,
    disabled: disabledProp = false,
    format,
    labelPosition = "inline",
    markers,
    min = 0,
    minLabel,
    max = 10,
    maxLabel,
    onChange,
    onChangeEnd,
    step = 1,
    stepMultiplier = 2,
    value: valueProp,
    ...rest
  },
  ref,
) {
  const [valueState, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "value",
  });

  const {
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    sliderRef,
  } = useSliderThumb({
    min,
    max,
    step,
    valueState,
    onChange,
    onChangeEnd,
    setValue,
  });

  const {
    a11yProps: { "aria-labelledby": formFieldLabelledBy } = {},
    disabled: formFieldDisabled,
  } = useFormFieldProps();

  const disabled = formFieldDisabled || disabledProp;
  const value = clamp(valueState, min, max);
  const progressPercentage = calculatePercentage(toFloat(value), max, min);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsedValue = toFloat(event.target.value);
    setValue(parsedValue);
    onChange?.(event, parsedValue);
    onChangeEnd?.(event, parsedValue);
  };

  return (
    <SliderTrack
      disabled={disabled}
      format={format}
      handlePointerDown={handlePointerDownOnTrack}
      labelPosition={labelPosition}
      isDragging={isDragging}
      min={min}
      minLabel={minLabel}
      max={max}
      maxLabel={maxLabel}
      markers={markers}
      progressPercentage={progressPercentage}
      ref={ref}
      sliderRef={sliderRef}
      {...rest}
    >
      <SliderThumb
        aria-label={ariaLabel}
        aria-labelledby={clsx(formFieldLabelledBy, ariaLabelledBy) || undefined}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuetext={ariaValueText}
        disabled={disabled}
        format={format}
        handleInputChange={handleInputChange}
        handlePointerDown={handlePointerDownOnThumb}
        min={min}
        minLabel={minLabel}
        max={max}
        maxLabel={maxLabel}
        offsetPercentage={`${progressPercentage}%`}
        sliderValue={value}
        step={step}
        stepMultiplier={stepMultiplier}
        trackDragging={isDragging}
      />
    </SliderTrack>
  );
});

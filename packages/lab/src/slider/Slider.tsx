import {
  type ChangeEvent,
  type HTMLAttributes,
  type SyntheticEvent,
  forwardRef,
} from "react";

import { useControlled, useFormFieldProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import sliderCss from "./Slider.css";
import { SliderThumb } from "./internal/SliderThumb";
import { SliderTrack } from "./internal/SliderTrack";
import { useSliderThumb } from "./internal/useSliderThumb";
import { toFloat } from "./internal/utils";

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Initial value of the slider
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
   * Name of the input
   */
  name?: string;
  /**
   * Label for maximum value
   */
  maxLabel?: string;
  /**
   * Label for the minimum value
   */
  minLabel?: string;
  /**
   * Change handler to be used when in a controlled state
   */
  onChange?: (event: SyntheticEvent, value: number) => void;
  /**
   * Minimum interval the slider thumb can move
   */
  step?: number;
  /**
   * Value of the slider, to be used when in a controlled state
   */
  value?: number;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    "aria-label": ariaLabel,
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
    step = 1,
    value: valueProp,
    style: styleProp,
    ...rest
  },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider",
    css: sliderCss,
    window: targetWindow,
  });

  const [valueState, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "value",
  });

  const {
    handleMouseDownOnThumb,
    handleMouseDownOnTrack,
    calculateAndSetThumbPosition,
    calculatePercentage,
    clamp,
    isDragging,
    sliderRef,
  } = useSliderThumb({
    min,
    max,
    step,
    valueState,
    // @ts-ignore onChange can accept both number and [number, number] value types
    onChange,
    // @ts-ignore setValue can accept both number and [number, number] value types
    setValue,
  });

  const {
    a11yProps: {
      "aria-labelledby": formFieldLabelledBy,
      "aria-describedby": formFieldDescribedBy,
    } = {},
    disabled: formFieldDisabled,
  } = useFormFieldProps();

  const disabled = formFieldDisabled || disabledProp;
  const value = clamp(valueState);
  const progressPercentage = calculatePercentage(toFloat(value));

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsedValue = toFloat(event.target.value);
    setValue(parsedValue);
    onChange?.(event, parsedValue);
  };

  return (
    <SliderTrack
      disabled={disabled}
      handleMouseDown={handleMouseDownOnTrack}
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
      style={styleProp}
    >
      <SliderThumb
        aria-describedby={formFieldDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={formFieldLabelledBy}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuetext={ariaValueText}
        disabled={disabled}
        format={format}
        handleInputChange={handleInputChange}
        handleMouseDown={handleMouseDownOnThumb}
        max={max}
        min={min}
        offsetPercentage={`${progressPercentage}%`}
        onChange={calculateAndSetThumbPosition}
        step={step}
        thumbValue={value}
        trackDragging={isDragging}
        {...rest}
      />
    </SliderTrack>
  );
});

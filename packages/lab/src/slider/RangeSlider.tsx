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
import { useRangeSliderThumb } from "./internal/useRangeSliderThumb";
import { calculatePercentage, clampRange, toFloat } from "./internal/utils";

export interface RangeSliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: [number, number];
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
   * Label for minimum value
   */
  minLabel?: string;
  /**
   * Callback when slider value is changed.
   */
  onChange?: (
    event: SyntheticEvent<unknown> | Event,
    value: [number, number],
  ) => void;
  /**
   * Callback called when the slider is stopped from being dragged or
   * its value is changed from the keyboard
   */
  onChangeEnd?: (
    event: SyntheticEvent<unknown> | Event,
    value: [number, number],
  ) => void;
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
  value?: [number, number];
}

export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  function RangeSlider(
    {
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-valuetext": ariaValueText,
      className,
      disabled: disabledProp = false,
      format,
      labelPosition = "inline",
      markers,
      max = 10,
      min = 0,
      maxLabel,
      minLabel,
      onChange,
      onChangeEnd,
      step = 1,
      stepMultiplier = 2,
      value: valueProp,
      defaultValue = [min, min + step],
      ...rest
    },
    ref,
  ) {
    const [valueState, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "RangeSlider",
      state: "value",
    });

    const {
      a11yProps: { "aria-labelledby": formFieldLabelledBy } = {},
      disabled: formFieldDisabled,
    } = useFormFieldProps();

    const {
      handlePointerDownOnThumb,
      handlePointerDownOnTrack,
      isDragging,
      sliderRef,
      thumbIndexState,
      preventThumbOverlap,
    } = useRangeSliderThumb({
      min,
      max,
      step,
      valueState,
      onChange,
      onChangeEnd,
      setValue,
    });

    const disabled = formFieldDisabled || disabledProp;
    const value: [number, number] = clampRange(valueState, max, min);
    const percentageStart = calculatePercentage(value[0], max, min);
    const percentageEnd = calculatePercentage(value[1], max, min);

    const thumbProps = {
      "aria-label": ariaLabel,
      "aria-labelledby": clsx(formFieldLabelledBy, ariaLabelledBy),
      "aria-valuemax": max,
      "aria-valuemin": min,
      "aria-valuetext": ariaValueText,
      disabled: disabled,
      format: format,
      max: max,
      min: min,
      step: step,
      stepMultiplier: stepMultiplier,
      sliderValue: value,
    };

    const handleInputChange = (
      event: ChangeEvent<HTMLInputElement>,
      thumbIndex: number,
    ) => {
      const parsedValue = toFloat(event.target.value);
      const values = preventThumbOverlap(parsedValue, value, thumbIndex);
      setValue(values as [number, number]);
      onChange?.(event, values as [number, number]);
      onChangeEnd?.(event, values as [number, number]);
    };

    return (
      <SliderTrack
        disabled={disabled}
        format={format}
        handlePointerDown={handlePointerDownOnTrack}
        isDragging={isDragging}
        labelPosition={labelPosition}
        markers={markers}
        min={min}
        minLabel={minLabel}
        max={max}
        maxLabel={maxLabel}
        progressPercentageRange={[percentageStart, percentageEnd]}
        ref={ref}
        sliderRef={sliderRef}
        isRange
        {...rest}
      >
        <SliderThumb
          index={0}
          handleInputChange={(event) => handleInputChange(event, 0)}
          handlePointerDown={(event) => handlePointerDownOnThumb(event, 0)}
          offsetPercentage={`${calculatePercentage(value[0], max, min)}%`}
          trackDragging={isDragging && thumbIndexState === 0}
          {...thumbProps}
        />
        <SliderThumb
          index={1}
          handleInputChange={(event) => handleInputChange(event, 1)}
          handlePointerDown={(event) => handlePointerDownOnThumb(event, 1)}
          offsetPercentage={`${calculatePercentage(value[1], max, min)}%`}
          trackDragging={isDragging && thumbIndexState === 1}
          {...thumbProps}
        />
      </SliderTrack>
    );
  },
);

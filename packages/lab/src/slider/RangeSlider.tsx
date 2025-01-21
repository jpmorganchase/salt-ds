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
import { toFloat } from "./internal/utils";

export interface RangeSliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Initial value of the slider
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
   * Label for the minimum value
   */
  minLabel?: string;
  /**
   * Name of the slider input
   */
  name?: string;
  /**
   * Change handler to be used when in a controlled state
   */
  onChange?: (event: SyntheticEvent, value: [number, number]) => void;
  /**
   * Minimum interval the slider thumb can move
   */
  step?: number;
  /**
   * The multiplier for the step when using PageUp and PageDown keys via keyboard interaction
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
      name,
      onChange,
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
      name: "Slider",
      state: "value",
    });

    const {
      a11yProps: { "aria-labelledby": formFieldLabelledBy } = {},
      disabled: formFieldDisabled,
    } = useFormFieldProps();

    const {
      handlePointerDownOnThumb,
      handlePointerDownOnTrack,
      calculateAndSetThumbPosition,
      calculatePercentage,
      clampRange,
      isDragging,
      sliderRef,
      thumbIndexState,
      preventThumbOverlap,
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

    const disabled = formFieldDisabled || disabledProp;
    const value: [number, number] = clampRange(valueState);
    const percentageStart = calculatePercentage(value[0]);
    const percentageEnd = calculatePercentage(value[1]);

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
      name: name,
      onChange: calculateAndSetThumbPosition,
      step: step,
      stepMultiplier: stepMultiplier,
      thumbValue: value,
    };

    const handleInputChange = (
      event: ChangeEvent<HTMLInputElement>,
      thumbIndex: number,
    ) => {
      const parsedValue = toFloat(event.target.value);
      const values = preventThumbOverlap(parsedValue, value, thumbIndex);
      setValue(values as [number, number]);
      onChange?.(event, values as [number, number]);
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
          offsetPercentage={`${calculatePercentage(value[0])}%`}
          trackDragging={isDragging && thumbIndexState === 0}
          {...thumbProps}
        />
        <SliderThumb
          index={1}
          handleInputChange={(event) => handleInputChange(event, 1)}
          handlePointerDown={(event) => handlePointerDownOnThumb(event, 1)}
          offsetPercentage={`${calculatePercentage(value[1])}%`}
          trackDragging={isDragging && thumbIndexState === 1}
          {...thumbProps}
        />
      </SliderTrack>
    );
  },
);

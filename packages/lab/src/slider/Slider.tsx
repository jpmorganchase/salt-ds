import {
  type ChangeEvent,
  type HTMLAttributes,
  type SyntheticEvent,
  forwardRef,
  useRef,
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
   * The number of allowed decimal places
   */
  decimalPlaces?: number;
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: number;
  /**
   * Disable the slider.
   */
  disabled?: boolean;
  /**
   * Show visual ticks above the mark labels
   */
  enableMarkTicks?: boolean;
  /**
   * A callback to format the display value in the tooltip, min and max labels
   * and the `aria-valuetext` attribute.
   */
  format?: (value: number) => string | number;
  /**
   * Marks that are displayed under the track.
   */
  marks?: { label: string; value: number }[];
  /**
   * Maximum slider value.
   */
  max?: number;
  /**
   * Minimum slider value.
   */
  min?: number;
  /**
   * Label for maximum value.
   */
  maxLabel?: string;
  /**
   * Label for the minimum value.
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
   * When bottom labels for minimum and maximum values are set, ensure
   * that they are confined within the boundary of the slider.
   */
  restrictLabelOverflow?: boolean;
  /**
   * Restrict slider value to marks only. The step will be ignored.
   */
  restrictToMarks?: boolean;
  /**
   * Show the slider value in a tooltip when the thumb is hovered.
   */
  showTooltip?: boolean;
  /**
   * Minimum interval the slider thumb can move.
   */
  step?: number;
  /**
   * Maximum interval the slider thumb can move when using PageUp and PageDown keys.
   */
  stepMultiplier?: number;
  /**
   * Value of the slider, to be used when in a controlled state.
   */
  value?: number;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-valuetext": ariaValueText,
    decimalPlaces = 2,
    disabled: disabledProp = false,
    enableMarkTicks,
    format,
    marks,
    min = 0,
    minLabel,
    max = 10,
    maxLabel,
    onChange,
    onChangeEnd,
    restrictLabelOverflow = false,
    restrictToMarks = false,
    showTooltip = true,
    step = 1,
    stepMultiplier = 2,
    value: valueProp,
    defaultValue = min + (max - min) / 2,
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

  const disabled = formFieldDisabled || disabledProp;
  const value = clamp(
    valueState,
    max,
    min,
    step,
    decimalPlaces,
    marks,
    restrictToMarks,
  );
  const progressPercentage = calculatePercentage(toFloat(value), max, min);
  const lastValueState = useRef<number>(value);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsedValue = toFloat(event.target.value);
    if (parsedValue !== lastValueState.current) {
      setValue(parsedValue);
      onChange?.(event, parsedValue);
      onChangeEnd?.(event, parsedValue);
      lastValueState.current = parsedValue;
    }
  };

  const {
    handleKeydownOnThumb,
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    sliderRef,
  } = useSliderThumb({
    decimalPlaces,
    handleInputChange,
    marks,
    min,
    max,
    step,
    value,
    onChange,
    onChangeEnd,
    restrictToMarks,
    setValue,
    stepMultiplier,
  });

  return (
    <SliderTrack
      disabled={disabled}
      enableMarkTicks={enableMarkTicks}
      format={format}
      handlePointerDown={handlePointerDownOnTrack}
      isDragging={isDragging}
      min={min}
      minLabel={minLabel}
      max={max}
      maxLabel={maxLabel}
      marks={marks}
      progressPercentage={progressPercentage}
      ref={ref}
      restrictLabelOverflow={restrictLabelOverflow}
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
        handleKeydownOnThumb={handleKeydownOnThumb}
        min={min}
        minLabel={minLabel}
        max={max}
        maxLabel={maxLabel}
        offsetPercentage={`${progressPercentage}%`}
        sliderValue={value}
        showTooltip={showTooltip}
        step={step}
        stepMultiplier={stepMultiplier}
        trackDragging={isDragging}
      />
    </SliderTrack>
  );
});

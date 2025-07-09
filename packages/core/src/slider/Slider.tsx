import { clsx } from "clsx";
import {
  type ChangeEvent,
  forwardRef,
  type HTMLAttributes,
  useRef,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import { useControlled } from "../utils";
import { SliderThumb } from "./internal/SliderThumb";
import { SliderTrack } from "./internal/SliderTrack";
import { useSliderThumb } from "./internal/useSliderThumb";
import { calculatePercentage, clamp, toFloat } from "./internal/utils";

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Accessible text to announce maximum value label.
   */
  accessibleMaxText?: string;
  /**
   * Accessible text to announce minimum value label.
   */
  accessibleMinText?: string;
  /**
   * When minimum and maximum labels are defined, ensure
   * they are confined within the boundary of the slider.
   * @default false
   */
  constrainLabelPosition?: boolean;
  /**
   * The number of allowed decimal places
   * @default 2
   */
  decimalPlaces?: number;
  /**
   * The default value. Use when the component is not controlled.
   * @default min + (max - min) / 2,
   */
  defaultValue?: number;
  /**
   * Disable the slider.
   */
  disabled?: boolean;
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
   * @default 10
   */
  max?: number;
  /**
   * Minimum slider value.
   * @default 0
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
   * It provides a generic event and the current value of the slider.
   */
  onChange?: (event: Event, value: number) => void;
  /**
   * Callback called when the slider is stopped from being dragged or
   * its value is changed from the keyboard. It provides a generic
   * event and the current value of the slider.
   */
  onChangeEnd?: (event: Event, value: number) => void;
  /**
   * Restrict slider value to marks only. The step will be ignored.
   */
  restrictToMarks?: boolean;
  /**
   * Show visual ticks above the marks.
   */
  showTicks?: boolean;
  /**
   * Show the slider value in a tooltip when the thumb is hovered.
   * @default true
   */
  showTooltip?: boolean;
  /**
   * Minimum interval the slider thumb can move.
   * @default 1
   */
  step?: number;
  /**
   * Maximum interval the slider thumb can move when using PageUp and PageDown keys.
   * @default 2
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
    accessibleMaxText,
    accessibleMinText,
    decimalPlaces = 2,
    disabled: disabledProp = false,
    format,
    marks,
    min = 0,
    minLabel,
    max = 100,
    maxLabel,
    onChange,
    onChangeEnd,
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
  const inputRef = useRef<HTMLInputElement>(null);
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
  const lastValueRef = useRef<number>(value);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsedValue = toFloat(event.target.value);
    if (parsedValue !== lastValueRef.current) {
      setValue(parsedValue);
      onChange?.(event.nativeEvent, parsedValue);
      onChangeEnd?.(event.nativeEvent, parsedValue);
      lastValueRef.current = parsedValue;
    }
  };

  const {
    handleBlur,
    handleFocus,
    handleKeydownOnThumb,
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    isFocusVisible,
    sliderRef,
  } = useSliderThumb({
    decimalPlaces,
    handleInputChange,
    inputRef,
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
      sliderRef={sliderRef}
      {...rest}
    >
      <SliderThumb
        aria-label={ariaLabel}
        aria-labelledby={clsx(formFieldLabelledBy, ariaLabelledBy) || undefined}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuetext={ariaValueText}
        accessibleMaxText={accessibleMaxText}
        accessibleMinText={accessibleMinText}
        disabled={disabled}
        format={format}
        onBlur={handleBlur}
        onFocus={handleFocus}
        handleInputChange={handleInputChange}
        handlePointerDown={handlePointerDownOnThumb}
        handleKeydownOnThumb={handleKeydownOnThumb}
        inputRef={inputRef}
        isFocusVisible={isFocusVisible}
        min={min}
        minLabel={minLabel}
        max={max}
        maxLabel={maxLabel}
        offsetPercentage={`${progressPercentage}%`}
        restrictToMarks={restrictToMarks}
        sliderValue={value}
        showTooltip={showTooltip}
        step={step}
        stepMultiplier={stepMultiplier}
        trackDragging={isDragging}
      />
    </SliderTrack>
  );
});

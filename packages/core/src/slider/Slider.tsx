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
   * The text that screen readers announce before the maximum value, in place
   * of `"maximum"`. When it's set, the maximum value isn't formatted with
   * `format`.
   */
  accessibleMaxText?: string;
  /**
   * The text that screen readers announce before the minimum value, in place
   * of `"minimum"`. When it's set, the minimum value isn't formatted with
   * `format`.
   */
  accessibleMinText?: string;
  /**
   * If `true`, the labels of the first and last marks are kept within the
   * boundary of the slider.
   */
  constrainLabelPosition?: boolean;
  /**
   * The number of allowed decimal places.
   * @default 2
   */
  decimalPlaces?: number;
  /**
   * The initial value. Use when the component is uncontrolled.
   * @default min + (max - min) / 2
   */
  defaultValue?: number;
  /**
   * If `true`, the slider is disabled. The slider is also disabled when the
   * surrounding `FormField` is disabled.
   */
  disabled?: boolean;
  /**
   * The function that formats the value shown in the tooltip and set as
   * `aria-valuetext`. It also formats the minimum and maximum values that
   * screen readers announce.
   */
  format?: (value: number) => string | number;
  /**
   * The marks shown under the track.
   */
  marks?: { label: string; value: number }[];
  /**
   * The maximum value of the slider.
   * @default 100
   */
  max?: number;
  /**
   * The minimum value of the slider.
   * @default 0
   */
  min?: number;
  /**
   * The label shown after the track for the maximum value. It's hidden from
   * screen readers. To change what they announce, use `accessibleMaxText`.
   */
  maxLabel?: string;
  /**
   * The label shown before the track for the minimum value. It's hidden from
   * screen readers. To change what they announce, use `accessibleMinText`.
   */
  minLabel?: string;
  /**
   * The name applied to the input.
   */
  name?: string;
  /**
   * Callback fired when the value of the slider changes.
   * @param event - The event that changed the value. It's `undefined` when the
   * value is changed from the keyboard.
   */
  onChange?: (event: Event, value: number) => void;
  /**
   * Callback fired when the user stops dragging the slider or changes its
   * value from the keyboard.
   * @param event - The event that ended the change. It's `undefined` when the
   * value is changed from the keyboard.
   */
  onChangeEnd?: (event: Event, value: number) => void;
  /**
   * If `true`, the slider value is restricted to the marks, and `step` is
   * ignored.
   */
  restrictToMarks?: boolean;
  /**
   * If `true`, visual ticks are shown above the marks. Only applies when
   * `marks` is set.
   */
  showTicks?: boolean;
  /**
   * If `true`, the slider value is shown in a tooltip when the thumb is
   * hovered, dragged or focused with the keyboard.
   * @default true
   */
  showTooltip?: boolean;
  /**
   * The interval between the values of the slider, and the amount that the
   * arrow keys change the value by. It's ignored when `restrictToMarks` is
   * `true`.
   * @default 1
   */
  step?: number;
  /**
   * The number of steps that the Page Up and Page Down keys change the value
   * by. It's ignored when `restrictToMarks` is `true`.
   * @default 2
   */
  stepMultiplier?: number;
  /**
   * The value of the slider. Use with `onChange` to control it.
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
    name,
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
        name={name}
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

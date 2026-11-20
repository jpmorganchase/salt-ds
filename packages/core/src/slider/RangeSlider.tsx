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
import { useRangeSliderThumb } from "./internal/useRangeSliderThumb";
import { calculatePercentage, clampRange, toFloat } from "./internal/utils";

export interface RangeSliderProps
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
   * The initial start and end values. Use when the component is uncontrolled.
   * @default [min, min + (max - min) / 2]
   */
  defaultValue?: [number, number];
  /**
   * If `true`, the slider is disabled. The slider is also disabled when the
   * surrounding `FormField` is disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, visual ticks are shown above the marks. Only applies when
   * `marks` is set.
   */
  showTicks?: boolean;
  /**
   * The function that formats the values shown in the tooltips and set as
   * `aria-valuetext`. It also formats the range, minimum and maximum values
   * that screen readers announce.
   */
  format?: (value: number) => string | number;
  /**
   * The marks shown under the track.
   */
  marks?: {
    /**
     * The label of the mark, shown under the track.
     */
    label: string;
    /**
     * The value of the mark, which sets its position on the track.
     */
    value: number;
  }[];
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
   * The name applied to the start value input.
   */
  startName?: string;
  /**
   * The name applied to the end value input.
   */
  endName?: string;
  /**
   * Callback fired when the start or end value of the slider changes.
   * @param event - The event that changed the value. It's `undefined` when the
   * value is changed from the keyboard.
   */
  onChange?: (event: Event, value: [number, number]) => void;
  /**
   * Callback fired when the user stops dragging the slider or changes its
   * value from the keyboard.
   * @param event - The event that ended the change. It's `undefined` when the
   * value is changed from the keyboard.
   */
  onChangeEnd?: (event: Event, value: [number, number]) => void;
  /**
   * If `true`, the slider value is restricted to the marks, and `step` is
   * ignored.
   */
  restrictToMarks?: boolean;
  /**
   * If `true`, each thumb's value is shown in a tooltip when the thumb is
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
   * The start and end values of the slider. Use with `onChange` to control it.
   */
  value?: [number, number];
}

export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  function RangeSlider(
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
      max = 100,
      min = 0,
      endName,
      maxLabel,
      minLabel,
      startName,
      onChange,
      onChangeEnd,
      restrictToMarks = false,
      showTooltip = true,
      step = 1,
      stepMultiplier = 2,
      value: valueProp,
      defaultValue = [min, min + (max - min) / 2],
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
    const lastValueRef = useRef<[number, number]>(valueState);

    const {
      a11yProps: { "aria-labelledby": formFieldLabelledBy } = {},
      disabled: formFieldDisabled,
    } = useFormFieldProps();

    const disabled = formFieldDisabled || disabledProp;
    const inputRefs = [
      useRef<HTMLInputElement>(null),
      useRef<HTMLInputElement>(null),
    ];
    const value: [number, number] = clampRange(
      valueState,
      max,
      min,
      step,
      decimalPlaces,
      marks,
      restrictToMarks,
    );
    const progressPercentageStart = calculatePercentage(value[0], max, min);
    const progressPercentageEnd = calculatePercentage(value[1], max, min);

    const handleInputChange = (
      event: ChangeEvent<HTMLInputElement>,
      thumbIndex: number,
    ) => {
      const parsedValue = toFloat(event.target.value);
      const values = preventThumbOverlap(parsedValue, value, thumbIndex);
      const haveValuesChanged =
        values[0] !== lastValueRef.current[0] ||
        values[1] !== lastValueRef.current[1];
      if (haveValuesChanged) {
        const values = preventThumbOverlap(parsedValue, value, thumbIndex);
        setValue(values as [number, number]);
        onChange?.(event.nativeEvent, values as [number, number]);
        onChangeEnd?.(event.nativeEvent, values as [number, number]);
        lastValueRef.current = values;
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
      thumbIndexState,
      preventThumbOverlap,
    } = useRangeSliderThumb({
      decimalPlaces,
      handleInputChange,
      inputRefs,
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

    const thumbProps = {
      "aria-label": ariaLabel,
      "aria-labelledby": clsx(formFieldLabelledBy, ariaLabelledBy),
      "aria-valuemax": max,
      "aria-valuemin": min,
      "aria-valuetext": ariaValueText,
      accessibleMaxText: accessibleMaxText,
      accessibleMinText: accessibleMinText,
      disabled: disabled,
      format: format,
      max: max,
      maxLabel: maxLabel,
      min: min,
      minLabel: minLabel,
      restrictToMarks: restrictToMarks,
      showTooltip: showTooltip,
      step: step,
      stepMultiplier: stepMultiplier,
      sliderValue: value,
    };

    return (
      <SliderTrack
        disabled={disabled}
        format={format}
        handlePointerDown={handlePointerDownOnTrack}
        isDragging={isDragging}
        isRange
        marks={marks}
        min={min}
        minLabel={minLabel}
        max={max}
        maxLabel={maxLabel}
        progressPercentageRange={[
          progressPercentageStart,
          progressPercentageEnd,
        ]}
        ref={ref}
        sliderRef={sliderRef}
        {...rest}
      >
        <SliderThumb
          index={0}
          handleInputChange={(event) => handleInputChange(event, 0)}
          handlePointerDown={(event) => handlePointerDownOnThumb(event, 0)}
          handleKeydownOnThumb={(event) => handleKeydownOnThumb(event, 0)}
          offsetPercentage={`${calculatePercentage(value[0], max, min)}%`}
          trackDragging={isDragging && thumbIndexState === 0}
          isFocusVisible={isFocusVisible && thumbIndexState === 0}
          inputRef={inputRefs[0]}
          onFocus={() => handleFocus(0)}
          onBlur={() => handleBlur(0)}
          {...thumbProps}
          name={startName}
        />
        <SliderThumb
          index={1}
          handleInputChange={(event) => handleInputChange(event, 1)}
          handlePointerDown={(event) => handlePointerDownOnThumb(event, 1)}
          handleKeydownOnThumb={(event) => handleKeydownOnThumb(event, 1)}
          offsetPercentage={`${calculatePercentage(value[1], max, min)}%`}
          trackDragging={isDragging && thumbIndexState === 1}
          isFocusVisible={isFocusVisible && thumbIndexState === 1}
          inputRef={inputRefs[1]}
          onFocus={() => handleFocus(1)}
          onBlur={() => handleBlur(1)}
          {...thumbProps}
          name={endName}
        />
      </SliderTrack>
    );
  },
);

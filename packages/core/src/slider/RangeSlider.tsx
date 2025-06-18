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
   */
  constrainLabelPosition?: boolean;
  /**
   * The number of allowed decimal places
   * @default 2
   */
  decimalPlaces?: number;
  /**
   * The default value. Use when the component is not controlled.
   * @default [min, min + (max - min) / 2]
   */
  defaultValue?: [number, number];
  /**
   * Disable the slider.
   */
  disabled?: boolean;
  /**
   * Show visual ticks above the marks.
   */
  showTicks?: boolean;
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
   * Label for minimum value.
   */
  minLabel?: string;
  /**
   * Callback called when slider value is changed.
   * It provides a generic event and the current value of the slider.
   */
  onChange?: (event: Event, value: [number, number]) => void;
  /**
   * Callback called when the slider is stopped from being dragged or
   * its value is changed from the keyboard. It provides a generic
   * event and the current value of the slider.
   */
  onChangeEnd?: (event: Event, value: [number, number]) => void;
  /**
   * Restrict slider value to marks only. The step will be ignored.
   */
  restrictToMarks?: boolean;
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
      maxLabel,
      minLabel,
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
    const inputRefs = Array.from({ length: 2 }, () =>
      useRef<HTMLInputElement>(null),
    );
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
        />
      </SliderTrack>
    );
  },
);

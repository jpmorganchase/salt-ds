import {
  type ChangeEvent,
  type HTMLAttributes,
  type SyntheticEvent,
  forwardRef,
} from "react";

import { makePrefixer, useControlled, useFormFieldProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import sliderCss from "./Slider.css";
import { SliderThumb } from "./internal/SliderThumb";
import { SliderTrack } from "./internal/SliderTrack";
import { useSliderThumb } from "./internal/useSliderThumb";
import { toFloat } from "./internal/utils";

const withBaseName = makePrefixer("saltSlider");

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
   * Name of the input
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
   * Value of the slider, to be used when in a controlled state
   */
  value?: [number, number];
}

export const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  function RangeSlider(
    {
      "aria-label": ariaLabel,
      "aria-valuetext": ariaValueText,
      className,
      disabled: disabledProp = false,
      format,
      labelPosition = "inline",
      markers,
      max = 10,
      min = 0,
      defaultValue = [min, max],
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
      a11yProps: {
        "aria-labelledby": formFieldLabelledBy,
        "aria-describedby": formFieldDescribedBy,
      } = {},
      disabled: formFieldDisabled,
    } = useFormFieldProps();

    const {
      handleMouseDownOnThumb,
      handleMouseDownOnTrack,
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

    const handleInputChange = (
      event: ChangeEvent<HTMLInputElement>,
      thumbIndex: number,
    ) => {
      const parsedValue = toFloat(event.target.value);
      const values = preventThumbOverlap(parsedValue, value, thumbIndex);
      setValue(values as [number, number]);
      onChange?.(event, values as [number, number]);
    };

    const percentageStart = calculatePercentage(value[0]);
    const percentageEnd = calculatePercentage(value[1]);

    return (
      <SliderTrack
        className={withBaseName("range")}
        disabled={disabled}
        handleMouseDown={handleMouseDownOnTrack}
        isDragging={isDragging}
        labelPosition={labelPosition}
        markers={markers}
        max={max}
        min={min}
        progressPercentageRange={[percentageStart, percentageEnd]}
        ref={ref}
        sliderRef={sliderRef}
        style={styleProp}
      >
        {[0, 1].map((thumbIndex: number) => (
          <SliderThumb
            aria-describedby={formFieldDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={formFieldLabelledBy}
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuetext={ariaValueText}
            disabled={disabled}
            format={format}
            handleInputChange={(event) => handleInputChange(event, thumbIndex)}
            handleMouseDown={(event) =>
              handleMouseDownOnThumb(event, thumbIndex)
            }
            index={thumbIndex}
            key={`thumb-${thumbIndex}`}
            max={max}
            min={min}
            offsetPercentage={`${calculatePercentage(value[thumbIndex])}%`}
            onChange={calculateAndSetThumbPosition}
            step={step}
            thumbValue={value}
            trackDragging={isDragging && thumbIndexState === thumbIndex}
            {...rest}
          />
        ))}
      </SliderTrack>
    );
  },
);

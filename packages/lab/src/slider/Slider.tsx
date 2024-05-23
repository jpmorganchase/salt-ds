import { Label, makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { SliderTrack, SliderMarks, SliderContext } from "./internal";

import sliderCss from "./Slider.css";
import { SliderChangeHandler, SliderValue } from "./types";

const withBaseName = makePrefixer("saltSlider");

const defaultMin = 0;
const defaultMax = 10;
const defaultStep = 1;

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Minimum slider value
   */
  min?: number;
  /**
   * Maximum slider value
   */
  max?: number;
  /**
   * Minimum interval the slider thumb can move
   */
  step?: number;
  /**
   * Initial value of the slider
   */
  defaultValue?: number;
  /**
   * The markings the slider is displayed with
   */
  marks?: "inline" | "bottom" | "all";
  /**
   * Value of the slider, to be used when in a controlled state
   */
  value?: number;
  /**
   * Change handler to be used when in a controlled state
   */
  onChange?: SliderChangeHandler;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    min = defaultMin,
    max = defaultMax,
    step = defaultStep,
    value: valueProp,
    defaultValue = defaultMin,
    onChange,
    className,
    ["aria-label"]: ariaLabel,
    marks = "inline",
    ...rest
  },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-slider",
    css: sliderCss,
    window: targetWindow,
  });

  const [value, setValue] = useControlled<SliderValue>({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "Value",
  });

  const handleSliderChange = (value: SliderValue) => {
    setValue(value);
    onChange?.(value);
  };

  return (
    <SliderContext.Provider
      value={{
        value,
        min,
        max,
        step,
        onChange: handleSliderChange,
        ariaLabel,
      }}
    >
      <div
        ref={ref}
        className={clsx(
          withBaseName(),
          { [withBaseName("bottomLabel")]: marks !== "inline" },
          className
        )}
        {...rest}
      >
        {marks !== "all" && (
          <Label
            className={clsx({
              [withBaseName("labelMinBottom")]: marks !== "inline",
            })}
          >
            {min}
          </Label>
        )}
        <SliderTrack />
        {marks !== "all" && (
          <Label
            className={clsx({
              [withBaseName("labelMaxBottom")]: marks !== "inline",
            })}
          >
            {max}
          </Label>
        )}
        {marks === "all" && <SliderMarks max={max} min={min} step={step} />}
      </div>
    </SliderContext.Provider>
  );
});

import { Label, makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { SliderTrack, SliderMarks, SliderContext } from "./internal";

import sliderCss from "./Slider.css";
import { SliderChangeHandler } from "./types";

const withBaseName = makePrefixer("saltSlider");

const defaultMin = 0;
const defaultMax = 10;
const defaultStep = 1;

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: SliderChangeHandler;
  hideLabels?: boolean;
  labels?: "inline" | "bottom" | "marks";
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
    labels = "inline",
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

  const [value, setValue] = useControlled<number>({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "Value",
  });

  return (
    <SliderContext.Provider
      value={{
        value,
        min,
        max,
        step,
        setValue,
        onChange,
        ariaLabel,
      }}
    >
      <div
        ref={ref}
        className={clsx(
          withBaseName(),
          { [withBaseName("bottomLabel")]: labels !== "inline" },
          className
        )}
        {...rest}
      >
        {labels !== "marks" && (
          <Label
            className={clsx({
              [withBaseName("labelMinBottom")]: labels !== "inline",
            })}
          >
            {min}
          </Label>
        )}
        <SliderTrack />
        {labels !== "marks" && (
          <Label
            className={clsx({
              [withBaseName("labelMaxBottom")]: labels !== "inline",
            })}
          >
            {max}
          </Label>
        )}
        {labels === "marks" && <SliderMarks max={max} min={min} step={step} />}
      </div>
    </SliderContext.Provider>
  );
});

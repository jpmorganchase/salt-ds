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
const minRange = 1; // for range

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: SliderChangeHandler | undefined;
  hideLabels?: boolean;
  tooltipPlacement?: "left" | "right" | "top" | "bottom";
  labels?: "inline" | "bottom" | "full";
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
    // ["aria-label"]: ariaLabel,
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

  //TODO: memoize the slider context, maybe the mouse and keydown hooks could also be memoized or in callback functions ?

  return (
    <SliderContext.Provider
      value={{
        value,
        min,
        max,
        step,
        setValue,
        onChange,
      }}
    >
      <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
        {labels !== "full" && (
          <Label
            className={clsx({
              [withBaseName("labelMinInline")]: labels === "inline",
              [withBaseName("labelMinBottom")]: labels === "bottom",
            })}
          >
            {min}
          </Label>
        )}
        <SliderTrack
          className={clsx({
            [withBaseName("trackInline")]: labels === "inline",
          })}
        />
        {labels !== "full" && (
          <Label
            className={clsx({
              [withBaseName("labelMaxInline")]: labels === "inline",
              [withBaseName("labelMaxBottom")]: labels === "bottom",
            })}
          >
            {max}
          </Label>
        )}
        {labels === "full" && <SliderMarks max={max} min={min} step={step} />}
      </div>
    </SliderContext.Provider>
  );
});

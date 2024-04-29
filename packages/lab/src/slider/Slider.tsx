import { Label, makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  SliderTrack,
  SliderMarks,
  SliderContext,
  SliderThumb,
} from "./internal";

import sliderCss from "./Slider.css";

const withBaseName = makePrefixer("saltSlider");

const defaultMin = 0;
const defaultMax = 10;
const defaultStep = 1;

//TODO: sort Slider marks and types

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
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
    // tooltipPlacement = "top", Pass into context to avoid prop drilling
    // ["aria-label"]: ariaLabel,
    hideLabels = false,
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
        {!hideLabels && labels !== "full" && (
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
        {!hideLabels && labels !== "full" && (
          <Label
            className={clsx({
              [withBaseName("labelMaxInline")]: labels === "inline",
              [withBaseName("labelMaxBottom")]: labels === "bottom",
            })}
          >
            {max}
          </Label>
        )}
        {/* {labels === "full" && <SliderMarks max={max} min={min} step={step} />} */}
      </div>
    </SliderContext.Provider>
  );
});

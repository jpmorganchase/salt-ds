import { Label, makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  SliderThumb,
  SliderTrack,
  SliderSelection,
  getTrackGridTemplateColumns,
  useSliderKeyDown,
  useSliderMouseDown,
  SliderMarks,
} from "./internal";

import sliderCss from "./Slider.css";

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
    tooltipPlacement = "top",
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

  const trackRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useControlled<number>({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "Value",
  });

  const onMouseDown = useSliderMouseDown(
    trackRef,
    value,
    min,
    max,
    step,
    setValue,
    onChange
  );

  const onKeyDown = useSliderKeyDown(value, min, max, step, setValue, onChange);

  const trackGridTeplateColumns = useMemo(
    () => getTrackGridTemplateColumns(min, max, value),
    [min, max, value]
  );

  return (
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
        style={trackGridTeplateColumns}
        className={clsx({
          [withBaseName("trackInline")]: labels === "inline",
        })}
        ref={trackRef}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
      >
        <SliderSelection />
        <SliderThumb
          value={value}
          min={min}
          max={max}
          aria-label={ariaLabel}
          tooltipPlacement={tooltipPlacement}
        />
      </SliderTrack>
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
  );
});

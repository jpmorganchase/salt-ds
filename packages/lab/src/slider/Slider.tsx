import { makePrefixer, useControlled, Label } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { SliderThumb } from "./internal/SliderThumb";
import { SliderTrack } from "./internal/SliderTrack";
import { SliderSelection } from "./internal/SliderSelection";
import { createTrackGridTemplateColumns } from "./internal/styles";
import { useSliderKeyDown } from "./internal/useSliderKeyDown";
import { useSliderMouseDown } from "./internal/useSliderMouseDown";
import { useValueUpdater } from "./internal/utils";
import { SliderChangeHandler, SliderValue } from "./types";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import sliderCss from "./Slider.css";

const withBaseName = makePrefixer("saltSlider");

const defaultMin = 0;
const defaultMax = 20;
const defaultStep = 1;

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  pageStep?: number;
  value?: SliderValue;
  defaultValue?: SliderValue;
  pushable?: boolean;
  pushDistance?: number;
  disabled?: boolean;
  onChange?: SliderChangeHandler;
  marks?: SliderMark[];
  hideMarks?: boolean;
  hideMarkLabels?: boolean;
  unit?: string; // Could add this, might be helpful
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    min = defaultMin,
    max = defaultMax,
    step = defaultStep,
    pageStep = step,
    value: valueProp,
    defaultValue = defaultMin,
    onChange,
    className,
    disabled,

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

  //When in a controlled state wht is the slider not being responsive to the mouse ?
  const [value, setValue] = useControlled<SliderValue>({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "Value",
  });

  // Look into what this does ?
  // Remove all the stuff for range and only leave stuff for the single slider
  const updateValueItem = useValueUpdater(min, max);

  const onMouseDown = useSliderMouseDown(
    trackRef,
    value,
    min,
    max,
    step,
    updateValueItem,
    setValue,
    onChange
  );

  const onKeyDown = useSliderKeyDown(
    value,
    min,
    max,
    pageStep,
    step,
    updateValueItem,
    setValue,
    onChange
  );

  // This doesn't seem entierly accurate - different calculation instead of lerp might be needed
  // In accuracy seems to be greater when min != 0
  const trackGridTeplateColumns = useMemo(
    () => createTrackGridTemplateColumns(min, max, value, step),
    [min, max, value, step]
  );

  return (
    <div ref={ref} className={clsx(withBaseName(), className)}>
      <Label>{min}</Label>
      <div className={withBaseName("trackContainer")} {...rest}>
        <SliderTrack
          style={trackGridTeplateColumns}
          ref={trackRef}
          onKeyDown={onKeyDown}
          onMouseDown={disabled ? undefined : onMouseDown}
        >
          <SliderSelection />
          <SliderThumb value={value} min={min} max={max} />
        </SliderTrack>
      </div>
      <Label>{max}</Label>
    </div>
  );
});

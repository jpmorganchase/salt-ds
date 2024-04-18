import { makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { SliderThumb } from "./internal/SliderThumb";
import { SliderTrack } from "./SliderTrack";
import { SliderSelection } from "./SliderSelection";
import { SliderMark } from "./internal/SliderRailMarks";
import { createTrackStyle } from "./internal/styles";
import { useSliderKeyDown } from "./internal/useSliderKeyDown";
import { useSliderMouseDown } from "./internal/useSliderMouseDown";
import { useValueUpdater } from "./internal/utils";
import { SliderChangeHandler, SliderValue } from "./types";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import sliderCss from "./Slider.css";
import { SliderRail } from "./internal/SliderRail";

const withBaseName = makePrefixer("saltSlider");

const defaultMin = 5;
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
    pushable,
    pushDistance = 0,
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

  const [value, setValue] = useControlled<SliderValue>({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "Value",
  });

  // Look into what this does ?
  const updateValueItem = useValueUpdater(pushable, pushDistance, min, max);

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

  const valueLength = Array.isArray(value) ? value.length : 1;

  const trackStyle = useMemo(
    () => createTrackStyle(min, max, value),
    [min, max, value]
  );

  console.log({ trackStyle });

  return (
    <div
      ref={ref}
      className={clsx(withBaseName(), className)}
      //On Key down should be on the track ?
      onKeyDown={onKeyDown}
      {...rest}
    >
      {min}
      <SliderTrack
        style={trackStyle}
        ref={trackRef}
        onMouseDown={disabled ? undefined : onMouseDown}
      >
        <SliderRail />
        <SliderSelection />
      </SliderTrack>
      {max}
    </div>
  );
});

{
  /* {(Array.isArray(value) ? value : [value]).map((value: number, i) => ( */
}
{
  /* <SliderThumb
          // key={i}
          value={value}
          min={min}
          max={max}
          // style={handleStyles[i]}
        /> */
}
{
  /* ))} */
}

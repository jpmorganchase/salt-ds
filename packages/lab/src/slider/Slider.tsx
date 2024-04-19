import { makePrefixer, useControlled, Label } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, useMemo, useRef } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  SliderThumb,
  SliderTrack,
  SliderSelection,
  createTrackGridTemplateColumns,
  useSliderKeyDown,
  useSliderMouseDown,
  SliderMarks,
} from "./internal";

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
  value?: number;
  defaultValue?: number;
  pushable?: boolean;
  pushDistance?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  unit?: string; // Could add this, might be helpful
  showMarks?: boolean;
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
    disabled,
    showMarks,
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

  //When in a controlled state why is the slider not being responsive to the mouse ?
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
    () => createTrackGridTemplateColumns(min, max, value, step),
    [min, max, value, step]
  );

  return (
    <div ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      <SliderTrack
        style={trackGridTeplateColumns}
        ref={trackRef}
        onKeyDown={disabled ? undefined : onKeyDown}
        onMouseDown={disabled ? undefined : onMouseDown}
      >
        <SliderSelection />
        <SliderThumb value={value} min={min} max={max} />
      </SliderTrack>
      {showMarks && <SliderMarks max={max} min={min} step={step} />}
    </div>
  );
});

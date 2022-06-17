import { makePrefixer, useControlled } from "@jpmorganchase/uitk-core";
import cn from "classnames";
import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  useMemo,
  useRef,
} from "react";
import { SliderHandle } from "./internal/SliderHandle";
import { SliderMarkLabels } from "./internal/SliderMarkLabels";
import { SliderRail } from "./internal/SliderRail";
import { SliderMark, SliderRailMarks } from "./internal/SliderRailMarks";
import { SliderSelection } from "./internal/SliderSelection";
import { createHandleStyles, createTrackStyle } from "./internal/styles";
import { useSliderKeyDown } from "./internal/useSliderKeyDown";
import { useSliderMouseDown } from "./internal/useSliderMouseDown";
import {
  SliderChangeHandler,
  SliderValue,
  useValueUpdater,
} from "./internal/utils";

import "./Slider.css";

const withBaseName = makePrefixer("uitkSlider");

const defaultMin = 0;
const defaultMax = 100;
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
    label,
    className,
    pushable,
    pushDistance = 0,
    disabled,
    marks,
    hideMarks,
    hideMarkLabels,
    ...restProps
  },
  ref
) {
  const trackRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useControlled<SliderValue>({
    controlled: valueProp,
    default: defaultValue,
    name: "Slider",
    state: "Value",
  });

  const updateValueItem = useValueUpdater(pushable, pushDistance, min, max);

  const trackStyle = useMemo(
    () => createTrackStyle(min, max, value),
    [min, max, value]
  );

  const valueLength = Array.isArray(value) ? value.length : 1;

  const handleStyles: CSSProperties[] = useMemo(
    () => createHandleStyles(valueLength),
    [valueLength]
  );

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

  return (
    <div
      className={cn(
        withBaseName(),
        {
          [withBaseName("disabled")]: disabled,
        },
        className
      )}
      ref={ref}
      onKeyDown={disabled ? undefined : onKeyDown}
      aria-label={`${label} slider from ${min} to ${max}`}
      role="group"
    >
      {label !== undefined ? (
        <div className={withBaseName("label")}>{label}</div>
      ) : null}
      <div
        className={withBaseName("clickable")}
        onMouseDown={disabled ? undefined : onMouseDown}
      >
        <div
          className={withBaseName("track")}
          style={trackStyle}
          ref={trackRef}
        >
          <SliderRail />
          {marks && !hideMarks ? (
            <SliderRailMarks min={min} max={max} marks={marks} />
          ) : null}
          {marks && !hideMarkLabels ? (
            <SliderMarkLabels min={min} max={max} marks={marks} />
          ) : null}
          <SliderSelection valueLength={valueLength} />
          {(Array.isArray(value) ? value : [value]).map((v, i) => (
            <SliderHandle
              key={i}
              min={min}
              max={max}
              value={v}
              index={i}
              disabled={!!disabled}
              valueLength={valueLength}
              style={handleStyles[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

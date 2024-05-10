import { SliderChangeHandler, SliderValue } from "../types";
import { RefObject } from "react";

export const getValue = (
  trackRef: RefObject<Element>,
  min: number,
  max: number,
  step: number,
  event: MouseEvent
) => {
  const { clientX } = event;
  if (trackRef.current) {
    const { width, x } = trackRef.current.getBoundingClientRect();
    const localX = clientX - x;
    const normaliseBetweenValues = (localX / width) * (max - min) + min;
    let value = roundToStep(normaliseBetweenValues, step);
    value = roundToTwoDp(value);
    value = clampValue(value, min, max);
    return value;
  }
};

export function setRangeValue(value: number[], newValue: number, setValue: SliderChangeHandler, onChange: SliderChangeHandler, index: number, step : number) {
  if (Math.abs(value[0] - newValue) < step ||  Math.abs(value[1] - newValue) < step ) return
  if (!index && newValue > value[1] ) return 
  if (index && newValue < value[0] ) return 
  index? setValue?.([value[0], newValue]) : setValue?.([newValue, value[1] ]) 
  index ? onChange?.([value[0], newValue]) : onChange?.([newValue, value[1] ])
}

// Can probably do this all in a single reduce function - look at other libraries
// Only needed on the track mouse down
export const getIndexOfClosestThumb = (
  newValue: SliderValue,
  value: number
) => {
  const thumbIndex = value.map((value) => {
    return Math.abs(value - newValue);
  });
  const closestThumbValue = Math.max(...thumbIndex);

  return thumbIndex.indexOf(closestThumbValue);
};

export const roundToTwoDp = (value: number) => Math.round(value * 100) / 100;

export const roundToStep = (value: number, step: number) =>
  Math.round(value / step) * step;

export const clampValue = (value: number, min: number, max: number) => {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
};

export function getPercentage(min: number, max: number, value: number) {
  const percentage = ((value - min) / (max - min)) * 100;
  return `${Math.min(Math.max(percentage, 0), 100)}%`;
}

export function getMarkStyles(min: number, max: number, step: number) {
  const marks = [];
  for (let i = min; i <= max; i = i + step) {
    const MarkPosition = getPercentage(min, max, i);
    const MarkLabel = roundToTwoDp(i);
    marks.push({ index: MarkLabel, position: MarkPosition });
  }
  return marks;
}

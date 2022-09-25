import { useMemo } from "react";
import { SliderValue } from "../types";
import { LabeledMark, SliderMark } from "./SliderRailMarks";

const updateValueItemNotPushable = (
  oldValue: number[],
  index: number,
  valueItem: number,
  min: number,
  max: number
) => {
  const newValue = [...oldValue];
  if (valueItem < oldValue[index]) {
    const constraint = index === 0 ? min : newValue[index - 1];
    newValue[index] = Math.max(constraint, valueItem);
  } else {
    const constraint =
      index === newValue.length - 1 ? max : newValue[index + 1];
    newValue[index] = Math.min(constraint, valueItem);
  }
  return newValue;
};

const updateValueItemPushable = (
  oldValue: number[],
  index: number,
  valueItem: number,
  min: number,
  max: number,
  pushDistance: number
) => {
  const newValue = [...oldValue];
  newValue[index] = valueItem;
  if (valueItem < oldValue[index]) {
    for (let i = index - 1; i >= 0; --i) {
      if (newValue[i + 1] - newValue[i] < pushDistance) {
        newValue[i] = newValue[i + 1] - pushDistance;
      } else {
        break;
      }
    }
    const distToMin = newValue[0] - min;
    if (distToMin < 0) {
      for (let i = index; i >= 0; --i) {
        newValue[i] -= distToMin;
      }
    }
  } else {
    for (let i = index + 1; i < newValue.length; ++i) {
      if (newValue[i] - newValue[i - 1] < pushDistance) {
        newValue[i] = newValue[i - 1] + pushDistance;
      } else {
        break;
      }
    }
    const distToMax = max - newValue[newValue.length - 1];
    if (distToMax < 0) {
      for (let i = index; i < newValue.length; ++i) {
        newValue[i] += distToMax;
      }
    }
  }
  return newValue;
};

export type UpdateValueItem = (
  oldValue: SliderValue,
  index: number,
  valueItem: number
) => SliderValue;

export function useValueUpdater(
  pushable: boolean | undefined,
  pushDistance: number,
  min: number,
  max: number
): UpdateValueItem {
  return useMemo(() => {
    const updater = pushable
      ? (oldValue: number[], index: number, valueItem: number) =>
          updateValueItemPushable(
            oldValue,
            index,
            valueItem,
            min,
            max,
            pushDistance
          )
      : (oldValue: number[], index: number, valueItem: number) =>
          updateValueItemNotPushable(oldValue, index, valueItem, min, max);
    return (oldValue: SliderValue, index: number, valueItem: number) => {
      if (!Array.isArray(oldValue)) {
        return valueItem;
      }
      if (oldValue[index] === valueItem) {
        return oldValue;
      }
      const newValue = updater(oldValue, index, valueItem);
      if (-1 === newValue.findIndex((v, i) => oldValue[i] !== v)) {
        return oldValue;
      }
      return newValue;
    };
  }, [pushable, pushDistance, min, max]);
}

export const roundValue = (v: number, step: number) =>
  Math.round(v / step) * step;

export const clampValue = (v: number, min: number, max: number) => {
  if (v < min) {
    return min;
  }
  if (v > max) {
    return max;
  }
  return v;
};

export function getSliderAriaLabel(count: number, index: number) {
  if (count < 2) {
    return;
  }
  if (count === 2) {
    return index === 0 ? "Min" : "Max";
  }
  if (index >= 0 && index < 10) {
    return [
      "First",
      "Second",
      "Third",
      "Fourth",
      "Fifth",
      "Sixth",
      "Seventh",
      "Eighth",
      "Ninth",
      "Tenth",
    ][index];
  }
  return;
}

export function getHandleIndex(element: HTMLElement): number {
  const handleIndexAttribute = element.getAttribute("data-handle-index");
  if (handleIndexAttribute) {
    return parseInt(handleIndexAttribute, 10);
  }
  return getHandleIndex(element.parentElement as HTMLElement);
}

export function isLabeledMark(mark: SliderMark): mark is LabeledMark {
  return typeof mark !== "number";
}

export function isMarkAtMax(max: number, mark: SliderMark) {
  return max === (isLabeledMark(mark) ? mark.value : mark);
}

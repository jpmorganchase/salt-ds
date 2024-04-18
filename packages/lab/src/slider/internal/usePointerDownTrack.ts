import { RefObject, MouseEvent } from "react";
import { getValue } from "./utils";
import { SliderChangeHandler, SliderValue } from "../types";

export function usePointerDownTrack(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler | undefined
) {
  return {
    trackProps: {
      onPointerDown(event: MouseEvent) {
        //@ts-ignore - React MouseEvent not compatible with global mouse event, causing type error on SliderTrack
        const newValue: number = getValue(trackRef, min, max, step, event);
        if (Array.isArray(value)) {
          const nearestThumb =
            Math.abs(value[0] - newValue) < Math.abs(value[1] - newValue)
              ? 0
              : 1;

          nearestThumb
            ? onChange?.([value[0], newValue])
            : onChange?.([newValue, value[1]]);
        } else {
          onChange?.(newValue);
        }
      },
    },
  };
}

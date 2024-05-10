import { RefObject } from "react";
import { getValue } from "./utils";
import { SliderChangeHandler, SliderValue } from "../types";

export function useMouseDownTrack(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler | undefined
) {
  return {
    trackProps: {
      onMouseDown(event: React.MouseEvent) {
        //@ts-ignore

        const newValue: number = getValue(trackRef, min, max, step, event);
        if (Array.isArray(value)) {
          const nearestThumb =
            Math.abs(value[0] - newValue) < Math.abs(value[1] - newValue)
              ? 0
              : 1;
          nearestThumb
            ? setValue([value[0], newValue])
            : setValue([newValue, value[1]]);

          nearestThumb
            ? onChange?.([value[0], newValue])
            : onChange?.([newValue, value[1]]);
        } else {
          setValue(newValue);
        }
      },
    },
  };
}

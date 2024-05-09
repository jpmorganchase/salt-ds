import { RefObject } from "react";
import { getIndexOfClosestThumb, getValue } from "./utils";
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

        const newValue = getValue(trackRef, min, max, step, event);
        if (Array.isArray(value)) {
          const closestThumbIndex = getIndexOfClosestThumb(newValue, value);
          closestThumbIndex
            ? setValue([newValue, value[1]])
            : setValue([value[0], newValue]);
        } else {
          setValue(newValue);
        }
      },
    },
  };
}

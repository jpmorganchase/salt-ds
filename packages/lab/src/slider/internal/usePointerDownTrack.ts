import { RefObject, MouseEvent } from "react";
import { getValue, setValue } from "./utils";
import { SliderChangeHandler, SliderValue } from "../types";

export function usePointerDownTrack(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler
) {
  return {
    trackProps: {
      onPointerDown(event: MouseEvent) {
        const { clientX } = event;
        const newValue: number = getValue(trackRef, min, max, step, clientX);

        const nearestIndex = value.reduce((acc, value) => {
          const difference = Math.abs(newValue - value);
          const prevDifference = Math.abs(newValue - acc);
          const index = difference < prevDifference ? 1 : 0;
          return index;
        }, 0);

        setValue(
          value,
          newValue,
          value.length > 1 ? nearestIndex : 0,
          onChange
        );
      },
    },
  };
}

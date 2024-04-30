import { RefObject } from "react";
import { getValue } from "./utils";
import { SliderChangeHandler } from "../types";

export function useMouseDownTrack(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler | undefined
) {
  return {
    trackProps: {
      onMouseDown(event: React.MouseEvent) {
        //@ts-ignore
        getValue(trackRef, min, max, step, setValue, onChange, event);
      },
    },
  };
}

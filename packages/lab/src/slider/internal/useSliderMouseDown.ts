import {
  MouseEvent as ReactMouseEvent,
  RefObject,
  useCallback,
  useRef,
} from "react";
import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundValue } from "./utils";

interface MouseContext {
  min: number;
  max: number;
  step: number;
  value: SliderValue;
  trackRef: RefObject<HTMLDivElement>;
  handleIndex?: number;
  setValue: SliderChangeHandler;
  onChange?: SliderChangeHandler;
}

const valueFromClientX = (context: MouseContext, x: number) => {
  const { min, max, step, trackRef } = context;
  const rect = trackRef.current!.getBoundingClientRect();
  const localX = x - rect.x;
  let v = (localX / rect.width) * (max - min) + min;
  v = roundValue(v, step);
  v = clampValue(v, min, max);
  return v;
};

export function useSliderMouseDown(
  trackRef: RefObject<HTMLDivElement>,
  value: SliderValue,
  min: number,
  max: number,
  step: number,
  setValue: SliderChangeHandler,
  onChange?: SliderChangeHandler
) {
  const mouseContext = useRef<MouseContext>({
    min,
    max,
    step,
    value,
    trackRef,
    setValue,
    onChange,
  });

  const onMouseMove = useCallback((event: MouseEvent) => {
    const { setValue, onChange } = mouseContext.current;
    const { clientX } = event;
    const clickValue = valueFromClientX(mouseContext.current, clientX);

    setValue(clickValue);
    onChange?.(clickValue);
  }, []);

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
    mouseContext.current.handleIndex = undefined;
  }, [onMouseMove]);

  return useCallback((event: ReactMouseEvent) => {
    const { setValue, onChange } = mouseContext.current;
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    const { clientX } = event; // x value of the mouse event
    const clickValue = valueFromClientX(mouseContext.current, clientX);
    setValue(clickValue);
    onChange?.(clickValue);

    event.preventDefault();
  }, []);
}

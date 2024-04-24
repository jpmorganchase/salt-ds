import {
  MouseEvent as ReactMouseEvent,
  RefObject,
  useCallback,
  useRef,
  useEffect
} from "react";
import { SliderChangeHandler, SliderValue } from "../types";
import { clampValue, roundToStep, roundToTwoDp } from "./utils";

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

const valueFromClientX = (context: MouseContext, distanceToMouse: number) => {
  const { min, max, step, trackRef } = context;
  const sliderTrackRect = trackRef.current!.getBoundingClientRect();
  const distanceFromTrackStart = distanceToMouse - sliderTrackRect.x;

  let value = (distanceFromTrackStart / sliderTrackRect.width) * (max - min) + min;

  value = roundToStep(value, step);
  value = roundToTwoDp(value)
  return value;
};

export function useSliderMouseDown(
  trackRef: RefObject<HTMLDivElement>,
  value: SliderValue,
  min: number,
  max: number,
  step: number,
  setValue: SliderChangeHandler,
  onChange?: SliderChangeHandler,
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

  useEffect(() => {
    const c = mouseContext.current;
    c.min = min;
    c.max = max;
    c.step = step;
    c.value = value;
    c.onChange = onChange;
    c.setValue = setValue;
  }, [min, max, step, value, setValue, onChange]);


  const onMouseMove = useCallback((event: MouseEvent) => {
    const { setValue, onChange } = mouseContext.current;
    const { clientX } = event;
    const clickValue = valueFromClientX(mouseContext.current, clientX);
    const newValue = clampValue(mouseContext.current.value, clickValue, min, max)

    setValue(newValue);
    onChange?.(newValue);
  }, []);

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  return useCallback((event: ReactMouseEvent) => {
    const { setValue, onChange } = mouseContext.current;
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    const { clientX } = event;
    const clickValue = valueFromClientX(mouseContext.current, clientX);
    const newValue = clampValue(mouseContext.current.value, clickValue, min, max)

    setValue(newValue);
    onChange?.(newValue);

    event.preventDefault();
  }, []);
}

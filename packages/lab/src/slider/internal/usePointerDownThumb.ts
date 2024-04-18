import { RefObject, useState } from "react";
import { SliderValue, SliderChangeHandler } from "../types";
import { getValue, setRangeValue } from "./utils";

export function usePointerDownThumb(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler,
  index: number
) {
  const [thumbActive, setThumbActive] = useState(false);

  const onDownThumb = () => {
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    setThumbActive(true);
  };

  const onPointerUp = (event: PointerEvent) => {
    event.preventDefault();
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    setThumbActive(false);
  };

  const onPointerMove = (event: PointerEvent): void => {
    const newValue: number | undefined = getValue(
      trackRef,
      min,
      max,
      step,
      event
    );
    Array.isArray(value)
      ? setRangeValue(value, newValue, onChange, index, step)
      : onChange?.(newValue);
  };

  return {
    thumbProps: {
      onPointerDown() {
        onDownThumb();
      },
      onFocus() {
        setThumbActive(true);
      },
      onPointerUp() {
        setThumbActive(false);
      },
      onBlur() {
        setThumbActive(false);
      },
    },
    thumbActive,
  };
}

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
  index: number,
  activeThumb: number | undefined,
  setActiveThumb: (index: number| undefined) => void
) {

  const [pointerDown, setPointerDown] = useState(false)

  const onDownThumb = () => {
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    setActiveThumb(index);
    setPointerDown(true)
  };

  const onPointerUp = (event: PointerEvent) => {
    event.preventDefault();
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    setActiveThumb(undefined);
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
      onPointerOver() {
        if (activeThumb === undefined ) setActiveThumb(index)
      },
      onFocus() {
        setActiveThumb(index);
      },
      onPointerUp() {
        setActiveThumb(undefined);
      },
      onBlur() {
        setActiveThumb(undefined);
      },
      onPointerOut() {
        !pointerDown && setActiveThumb(undefined);
      },
    },
    activeThumb,
  };
}

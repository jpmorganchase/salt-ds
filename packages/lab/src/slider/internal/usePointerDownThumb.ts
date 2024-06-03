import { RefObject, useState } from "react";
import { SliderValue, SliderChangeHandler } from "../types";
import { getValue, setValue } from "./utils";

export function usePointerDownThumb(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler,
  index: number,
  activeThumb: number | undefined,
  setActiveThumb: (index: number | undefined) => void
) {
  const [pointerDown, setPointerDown] = useState(false);

  const onDownThumb = () => {
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    setActiveThumb(index);
    setPointerDown(true);
  };

  const onPointerUp = (event: PointerEvent) => {
    event.preventDefault();
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    setActiveThumb(undefined);
    setPointerDown(false);
  };

  const onPointerMove = (event: PointerEvent): void => {
    let newValue: number | undefined = getValue(
      trackRef,
      min,
      max,
      step,
      event
    );

    value.length > 1
      ? (newValue =
          index === 0
            ? Math.min(newValue, value[1] - step)
            : Math.max(newValue, value[0] + step))
      : null;
    setValue(value, newValue, index, onChange);
  };

  return {
    thumbProps: {
      onPointerDown() {
        onDownThumb();
      },
      onPointerOver() {
        if (activeThumb === undefined) setActiveThumb(index);
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

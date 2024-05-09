import { RefObject, useState } from "react";
import { SliderValue, SliderChangeHandler } from "../types";
import { getValue } from "./utils";

export function useMouseDownThumb(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler | undefined,
  index: number
) {
  const [thumbFocus, setThumbFocus] = useState(false);

  const onMouseMove = (event: MouseEvent): void => {
    // event.preventDefault();
    const newValue = getValue(trackRef, min, max, step, event);
    if (Array.isArray(value)) {
      index ? setValue([newValue, value[1]]) : setValue([value[0], newValue]);
      index
        ? onChange?.([newValue, value[1]], index)
        : onChange?.([value[0], newValue], index);
    } else {
      setValue(newValue);
      onChange?.(newValue, index);
    }
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    setThumbFocus(false);
  };

  const onDownThumb = () => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return {
    thumbProps: {
      onMouseDown() {
        onDownThumb();
      },
      onFocus() {
        setThumbFocus(true);
      },
      onBlur() {
        setThumbFocus(false);
      },
      onMouseLeave() {
        setThumbFocus(false);
      },
      onMouseOver() {
        setThumbFocus(true);
      },
    },
    thumbFocus,
  };
}

import { RefObject, useState } from "react";
import { SliderValue, SliderChangeHandler } from "../types";
import { getValue, setRangeValue } from "./utils";

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
    event.preventDefault();
    const newValue: number = getValue(trackRef, min, max, step, event);
    Array.isArray(value)
      ? setRangeValue(value, newValue, setValue, onChange, index, step)
      : (setValue(newValue), onChange?.(newValue))
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

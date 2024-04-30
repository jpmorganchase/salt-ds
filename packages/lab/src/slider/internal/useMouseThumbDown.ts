import { RefObject, useState } from "react";
import { SliderValue, SliderChangeHandler } from "../types";
import { getValue } from "./utils";

export function useMouseThumbDown(
  trackRef: RefObject<Element>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  setValue: SliderChangeHandler,
  onChange: SliderChangeHandler
) {
  const [thumbFocus, setThumbFocus] = useState(false);

  if (Array.isArray(value)) {
    console.log("value = range");
  }

  const onMouseMove = (event: MouseEvent) => {
    getValue(trackRef, min, max, step, setValue, onChange, event);
    setThumbFocus(true);
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

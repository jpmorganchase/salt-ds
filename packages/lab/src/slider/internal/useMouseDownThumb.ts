import { RefObject, useState, useRef } from "react";
import { SliderValue, SliderChangeHandler } from "../types";
import { getValue, setRangeValue } from "./utils";

export function useMouseDownThumb(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler,
  index: number
) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const activeThumbIndex = useRef<{ index: number | undefined }>({
    index: undefined,
  });

  const onDownThumb = () => {
    document.addEventListener("pointermove", onMouseMove);
    document.addEventListener("pointerup", onMouseUp);
    setMouseDown(true);
    activeThumbIndex.current.index = index;
  };

  const onMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    document.removeEventListener("pointermove", onMouseMove);
    document.removeEventListener("pointerup", onMouseUp);
    setTooltipVisible(false);
    setMouseDown(false);
    activeThumbIndex.current.index = 0;
  };

  const onMouseMove = (event: MouseEvent): void => {
    const newValue: number = getValue(trackRef, min, max, step, event);
    Array.isArray(value)
      ? setRangeValue(value, newValue, onChange, index, step)
      : onChange?.(newValue);
  };

  return {
    thumbProps: {
      onMouseDown() {
        onDownThumb();
      },
      onMouseOver() {
        setTooltipVisible(true);
      },
      onFocus() {
        setTooltipVisible(true);
      },
      onMouseUp() {
        setTooltipVisible(false);
      },
      onBlur() {
        setTooltipVisible(false);
      },
      onMouseLeave() {
        !mouseDown && setTooltipVisible(false);
      },
    },
    tooltipVisible,
  };
}

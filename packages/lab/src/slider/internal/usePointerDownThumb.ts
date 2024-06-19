import { RefObject, useState } from "react";
import { SliderValue, SliderChangeHandler } from "../types";
import { getNearestIndex, getValue, setValue } from "./utils";

export function usePointerDownThumb(
  trackRef: RefObject<HTMLDivElement>,
  min: number,
  max: number,
  step: number,
  value: SliderValue,
  onChange: SliderChangeHandler,
  index: number | null,
  activeThumb: number | undefined,
  setActiveThumb: (index: number | undefined) => void
) {
  const [pointerDown, setPointerDown] = useState(false);

  const onDownThumb = (index: number) => {
    const handlePointerMove = (e: PointerEvent) => onPointerMove(e, index);
    const handlePointerUp = (e: PointerEvent) =>
      _onPointerUp(e, handlePointerMove, handlePointerUp);

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    setActiveThumb(index);
    setPointerDown(true);
  };

  const _onPointerUp = (
    event: PointerEvent,
    handlePointerMove: (e: PointerEvent) => void,
    handlePointerUp: (e: PointerEvent) => void
  ) => {
    event.preventDefault();
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    setActiveThumb(undefined);
    setPointerDown(false);
  };

  const onPointerMove = (event: PointerEvent, index: number): void => {
    if (index === null) return;

    const { clientX } = event;
    let newValue: number | undefined = getValue(
      trackRef,
      min,
      max,
      step,
      clientX
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
    trackProps: {
      onPointerDown(event: PointerEvent) {
        const { clientX } = event;
        const newValue: number = getValue(trackRef, min, max, step, clientX);
        const nearestIndex = getNearestIndex(value, newValue);

        setValue(
          value,
          newValue,
          value.length > 1 ? nearestIndex : 0,
          onChange
        );
        onDownThumb(nearestIndex);
      },
      onPointerUp() {
        setActiveThumb(undefined);
      },
      onPointerOut() {
        !pointerDown && setActiveThumb(undefined);
      },
    },
    thumbProps: {
      onPointerDown(event: PointerEvent) {
        event.stopPropagation();
        if (index === null) return;
        onDownThumb(index);
      },
      onPointerOver() {
        if (activeThumb === undefined && index !== null) setActiveThumb(index);
      },
      onFocus() {
        if (index !== null) setActiveThumb(index);
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

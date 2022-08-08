import {
  MouseEvent as ReactMouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  clampValue,
  roundValue,
  SliderChangeHandler,
  SliderValue,
  UpdateValueItem,
} from "./utils";

interface MouseContext {
  min: number;
  max: number;
  step: number;
  value: SliderValue;
  trackRef: RefObject<HTMLDivElement>;
  handleIndex?: number;
  updateValueItem: UpdateValueItem;
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

function getNearestHandle(value: SliderValue, clickValue: number): number {
  if (!Array.isArray(value)) {
    return 0;
  }
  let minDistance = Number.MAX_VALUE;
  let handleIndex = -1;
  value.forEach((v, i) => {
    const d = Math.abs(clickValue - v);
    if (d < minDistance) {
      minDistance = d;
      handleIndex = i;
    }
  });
  return handleIndex;
}

export function useSliderMouseDown(
  trackRef: RefObject<HTMLDivElement>,
  value: SliderValue,
  min: number,
  max: number,
  step: number,
  updateValueItem: UpdateValueItem,
  setValue: SliderChangeHandler,
  onChange?: SliderChangeHandler
) {
  const mouseContext = useRef<MouseContext>({
    min,
    max,
    step,
    value,
    trackRef,
    updateValueItem,
    setValue,
    onChange,
  });

  useEffect(() => {
    const c = mouseContext.current;
    c.min = min;
    c.max = max;
    c.step = step;
    c.value = value;
    c.updateValueItem = updateValueItem;
    c.onChange = onChange;
    c.setValue = setValue;
  }, [min, max, step, value, setValue, updateValueItem, onChange]);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const { handleIndex, value, updateValueItem, setValue, onChange } =
      mouseContext.current;
    if (handleIndex === undefined) {
      return;
    }
    const { clientX } = event;
    const clickValue = valueFromClientX(mouseContext.current, clientX);
    const newValue = updateValueItem(value, handleIndex, clickValue);
    if (newValue !== value) {
      setValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  }, []);

  const onMouseUp = useCallback((event: MouseEvent) => {
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mousemove", onMouseMove);
    mouseContext.current.handleIndex = undefined;
  }, []);

  return useCallback((event: ReactMouseEvent) => {
    const { value, setValue, onChange } = mouseContext.current;
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);

    const { clientX } = event;
    const clickValue = valueFromClientX(mouseContext.current, clientX);

    const handleIndex = getNearestHandle(value, clickValue);
    mouseContext.current.handleIndex = handleIndex;
    const newValue = updateValueItem(value, handleIndex, clickValue);

    if (newValue !== value) {
      setValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }

    event.preventDefault();
  }, []);
}

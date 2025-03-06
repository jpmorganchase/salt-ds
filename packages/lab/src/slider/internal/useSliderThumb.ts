import { useWindow } from "@salt-ds/window";
import {
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SliderProps } from "../Slider";
import { getClickedPosition } from "./utils";

type UseSliderThumbProps = Pick<SliderProps, "min" | "max" | "step"> & {
  onChange?: (event: SyntheticEvent<unknown> | Event, value: number) => void;
  onChangeEnd?: (event: SyntheticEvent<unknown> | Event, value: number) => void;
  setValue: Dispatch<SetStateAction<number>>;
  valueState: number;
};

export const useSliderThumb = ({
  min = 0,
  max = 10,
  step = 1,
  onChange,
  onChangeEnd,
  setValue,
  valueState,
}: UseSliderThumbProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const currentValueRef = useRef<number>(valueState);
  const sliderRef = useRef<HTMLDivElement>(null);
  const targetWindow = useWindow();

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!sliderRef.current) return;
      const newValue = getClickedPosition(
        sliderRef,
        event.clientX,
        max,
        min,
        step,
      );
      if (newValue === undefined || currentValueRef.current === newValue) {
        return;
      }
      currentValueRef.current = newValue;
      setValue(newValue);
      onChange?.(event, newValue);
    },
    [max, min, onChange, setValue, step],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      setIsDragging(false);
      onChangeEnd?.(event, currentValueRef.current);
    },
    [onChangeEnd],
  );

  useEffect(() => {
    if (isDragging) {
      targetWindow?.addEventListener("pointermove", handlePointerMove);
      targetWindow?.addEventListener("pointerup", handlePointerUp);
    } else {
      targetWindow?.removeEventListener("pointermove", handlePointerMove);
      targetWindow?.removeEventListener("pointerup", handlePointerUp);
    }
    return () => {
      targetWindow?.removeEventListener("pointermove", handlePointerMove);
      targetWindow?.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp, isDragging, targetWindow]);

  const handlePointerDownOnThumb = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    [],
  );

  const handlePointerDownOnTrack = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
      const newValue = getClickedPosition(
        sliderRef,
        event.clientX,
        max,
        min,
        step,
      );
      if (newValue === undefined || currentValueRef.current === newValue) {
        return;
      }
      currentValueRef.current = newValue;
      setValue(newValue);
      onChange?.(event, newValue);
    },
    [max, min, onChange, setValue, step],
  );

  return {
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    sliderRef,
  };
};

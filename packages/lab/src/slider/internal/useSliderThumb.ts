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
  const currentSliderValueRef = useRef<number>(valueState);
  const sliderRef = useRef<HTMLDivElement>(null);
  const targetWindow = useWindow();

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
  }, [isDragging, targetWindow]);

  const calculateAndSetThumbPosition = (event: PointerEvent) => {
    if (!sliderRef.current) return;

    const newValue = getClickedPosition(
      sliderRef,
      event.clientX,
      min,
      max,
      step,
    );

    if (newValue === undefined || currentSliderValueRef.current === newValue)
      return;

    currentSliderValueRef.current = newValue;
    setValue(newValue);
    onChange?.(event, newValue);
  };

  const handlePointerDownOnThumb = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerDownOnTrack = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
      const newValue = getClickedPosition(
        sliderRef,
        event.clientX,
        min,
        max,
        step,
      );
      if (newValue === undefined) return;
      setValue(newValue);
      onChange?.(event, newValue);
    },
    [max, min, onChange, setValue, step],
  );

  const handlePointerMove = (event: PointerEvent) => {
    calculateAndSetThumbPosition(event);
  };

  const handlePointerUp = (event: PointerEvent) => {
    setIsDragging(false);
    onChangeEnd?.(event, currentSliderValueRef.current);
  };

  return {
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    sliderRef,
  };
};

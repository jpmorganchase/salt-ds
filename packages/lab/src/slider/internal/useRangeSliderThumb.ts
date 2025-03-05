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

type UseRangeSliderThumbProps = Pick<SliderProps, "min" | "max" | "step"> & {
  onChange?: (
    event: SyntheticEvent<unknown> | Event,
    value: [number, number],
  ) => void;
  onChangeEnd?: (
    event: SyntheticEvent<unknown> | Event,
    value: [number, number],
  ) => void;
  setValue: Dispatch<SetStateAction<[number, number]>>;
  valueState: [number, number];
};

export const useRangeSliderThumb = ({
  min = 0,
  max = 10,
  step = 1,
  onChange,
  onChangeEnd,
  setValue,
  valueState,
}: UseRangeSliderThumbProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [thumbIndexState, setIsThumbIndex] = useState<number>(0);
  const currentSliderValueRef = useRef<[number, number]>(valueState);

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

  const clampRange = useCallback(
    (range: [number, number]): [number, number] => {
      let [start, end] = range;

      if (Number.isNaN(start)) {
        start = min;
      }
      if (Number.isNaN(end)) {
        end = max;
      }
      if (start > end) {
        [start, end] = [end, start];
      }
      start = Math.min(Math.max(start, min), max);
      end = Math.min(Math.max(end, min), max);

      return [start, end];
    },
    [min, max],
  );

  const preventThumbOverlap = useCallback(
    (
      currentValue: number,
      sliderValues: [number, number],
      thumbIndex: number,
    ) => {
      const values = [...sliderValues] as [number, number];
      if (thumbIndex === 0 && currentValue >= values[1]) {
        values[0] = values[1];
      } else if (thumbIndex === 1 && currentValue <= values[0]) {
        values[1] = values[0];
      } else {
        values[thumbIndex] = currentValue;
      }
      return values;
    },
    [],
  );

  const clampedCurrentSliderValue = clampRange(currentSliderValueRef.current);

  const calculateAndSetThumbPosition = (event: PointerEvent) => {
    if (!sliderRef.current) return;

    const newValue = getClickedPosition(
      sliderRef,
      event.clientX,
      min,
      max,
      step,
    );

    if (newValue === undefined) return;

    const newValues = preventThumbOverlap(
      newValue,
      clampedCurrentSliderValue as [number, number],
      thumbIndexState,
    );

    if (
      newValues[0] !== currentSliderValueRef.current[0] ||
      newValues[1] !== currentSliderValueRef.current[1]
    ) {
      currentSliderValueRef.current = newValues;
      setValue(newValues);
      onChange?.(event, newValues);
    }
  };

  const handlePointerDownOnThumb = (
    event: React.PointerEvent<HTMLDivElement>,
    thumbIndex?: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    if (thumbIndex !== undefined) {
      setIsThumbIndex(thumbIndex);
    }
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
      const newValues = [...clampedCurrentSliderValue] as [number, number];
      // Find nearest thumb
      const distanceToThumb0 = Math.abs(newValue - newValues[0]);
      const distanceToThumb1 = Math.abs(newValue - newValues[1]);
      if (distanceToThumb0 > distanceToThumb1) {
        // Move the second thumb
        newValues[1] = newValue;
        setIsThumbIndex(1);
      } else if (distanceToThumb0 < distanceToThumb1) {
        // Move the first thumb
        newValues[0] = newValue;
        setIsThumbIndex(0);
      } else {
        // If distances are equal, determine based on the click position
        if (newValue < newValues[0]) {
          // Clicked position is before both thumbs, move the first thumb
          newValues[0] = newValue;
          setIsThumbIndex(0);
        } else if (newValue > newValues[1]) {
          // Clicked position is after both thumbs, move the second thumb
          newValues[1] = newValue;
          setIsThumbIndex(1);
        } else {
          // Clicked position is between the thumbs, move the first thumb
          newValues[0] = newValue;
          setIsThumbIndex(0);
        }
      }
      setValue(newValues);
      onChange?.(event, newValues);
    },
    [clampedCurrentSliderValue, max, min, onChange, setValue, step],
  );

  const handlePointerMove = (event: PointerEvent) => {
    calculateAndSetThumbPosition(event);
  };

  const handlePointerUp = (event: PointerEvent) => {
    setIsDragging(false);
    onChangeEnd?.(event, currentSliderValueRef.current);
  };

  return {
    clampRange,
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    preventThumbOverlap,
    sliderRef,
    thumbIndexState,
  };
};

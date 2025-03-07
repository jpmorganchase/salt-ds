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
import { clampRange, getClickedPosition } from "./utils";

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
  const lastValueRef = useRef<[number, number]>(valueState);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderValues = clampRange(valueState, max, min);
  const targetWindow = useWindow();

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
      if (newValue === undefined) return;
      const newValues = preventThumbOverlap(
        newValue,
        sliderValues as [number, number],
        thumbIndexState,
      );

      if (
        newValues[0] !== lastValueRef.current[0] ||
        newValues[1] !== lastValueRef.current[1]
      ) {
        lastValueRef.current = newValues;
        setValue(newValues);
        onChange?.(event, newValues);
      }
    },
    [
      max,
      min,
      step,
      preventThumbOverlap,
      sliderValues,
      thumbIndexState,
      setValue,
      onChange,
    ],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      setIsDragging(false);
      onChangeEnd?.(event, lastValueRef.current);
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
    (event: React.PointerEvent<HTMLDivElement>, thumbIndex?: number) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
      if (thumbIndex !== undefined) {
        setIsThumbIndex(thumbIndex);
      }
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
      if (newValue === undefined) return;
      const newValues = [...sliderValues] as [number, number];
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
      if (
        newValues[0] !== lastValueRef.current[0] ||
        newValues[1] !== lastValueRef.current[1]
      ) {
        lastValueRef.current = newValues;
        setValue(newValues);
        onChange?.(event, newValues);
      }
    },
    [sliderValues, max, min, onChange, setValue, step],
  );

  return {
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    preventThumbOverlap,
    sliderRef,
    thumbIndexState,
  };
};

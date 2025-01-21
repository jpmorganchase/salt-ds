import { useWindow } from "@salt-ds/window";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SliderProps } from "../Slider";

export const useSliderThumb = ({
  min = 0,
  max = 10,
  step = 1,
  onChange,
  setValue,
  valueState,
}: Pick<SliderProps, "min" | "max" | "step"> & {
  setValue: Dispatch<SetStateAction<number | [number, number]>>;
  onChange?: (
    event: PointerEvent | React.PointerEvent,
    value: number | [number, number],
  ) => void;
  valueState: number | [number, number];
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [thumbIndexState, setIsThumbIndex] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const targetWindow = useWindow();

  useEffect(() => {
    if (isDragging) {
      targetWindow?.addEventListener("pointermove", handlePointerMove);
      targetWindow?.addEventListener("pointerup", handlePointerUp);
    } else {
      targetWindow?.removeEventListener("pointermove", handlePointerMove);
      targetWindow?.removeEventListener("Pointerup", handlePointerUp);
    }

    return () => {
      targetWindow?.removeEventListener("pointermove", handlePointerMove);
      targetWindow?.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, targetWindow]);

  // **** Calculations ********

  const calculatePercentage = (value: number) =>
    ((value - min) / (max - min)) * 100;

  const clamp = useCallback(
    (value: number) => {
      return Number.isNaN(value) ? min : Math.min(Math.max(value, min), max);
    },
    [min, max],
  );

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

  const sliderValue = Array.isArray(valueState)
    ? clampRange(valueState)
    : clamp(valueState);

  const getClickedPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const sliderRect = sliderRef.current.getBoundingClientRect();
      const rawValue =
        ((clientX - sliderRect.left) / sliderRect.width) * (max - min) + min;
      const steppedValue = Math.round(rawValue / step) * step;
      return clamp(steppedValue);
    },
    [min, max, step, clamp],
  );

  const calculateAndSetThumbPosition = useCallback(
    (event: PointerEvent | React.PointerEvent) => {
      if (!sliderRef.current) return;

      const newValue = getClickedPosition(event.clientX);
      if (newValue === undefined) return;

      // Range slider
      if (Array.isArray(sliderValue)) {
        const values = preventThumbOverlap(
          newValue,
          sliderValue as [number, number],
          thumbIndexState,
        );
        setValue(values);
        onChange?.(event, values);
      } else {
        // Single slider
        setValue(newValue);
        onChange?.(event, newValue);
      }
    },
    [
      sliderValue,
      thumbIndexState,
      setValue,
      onChange,
      getClickedPosition,
      preventThumbOverlap,
    ],
  );

  // ******* Event Handlers ***********

  const handlePointerDownOnThumb = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, thumbIndex?: number) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
      const newValue = getClickedPosition(event.clientX);
      if (newValue === undefined) return;
      // Range slider
      if (Array.isArray(sliderValue) && thumbIndex !== undefined) {
        setIsThumbIndex(thumbIndex);
        const values = [...sliderValue] as [number, number];
        values[thumbIndex] = newValue;
        setValue(values);
        onChange?.(event, values);
      } else {
        // Single slider
        setValue(newValue);
        onChange?.(event, newValue);
      }
    },
    [getClickedPosition, setValue, onChange, sliderValue],
  );

  const handlePointerDownOnTrack = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
      const newValue = getClickedPosition(event.clientX);
      if (newValue === undefined) return;

      // Range slider
      if (Array.isArray(sliderValue)) {
        const values = [...sliderValue] as [number, number];
        // Find nearest thumb
        const distanceToThumb0 = Math.abs(newValue - values[0]);
        const distanceToThumb1 = Math.abs(newValue - values[1]);
        if (distanceToThumb0 > distanceToThumb1) {
          // Move the second thumb
          values[1] = newValue;
          setIsThumbIndex(1);
        } else if (distanceToThumb0 < distanceToThumb1) {
          // Move the first thumb
          values[0] = newValue;
          setIsThumbIndex(0);
        } else {
          // If distances are equal, determine based on the click position
          if (newValue < values[0]) {
            // Clicked position is before both thumbs, move the first thumb
            values[0] = newValue;
            setIsThumbIndex(0);
          } else if (newValue > values[1]) {
            // Clicked position is after both thumbs, move the second thumb
            values[1] = newValue;
            setIsThumbIndex(1);
          } else {
            // Clicked position is between the thumbs, decide based on preference
            // For example, default to moving the first thumb
            values[0] = newValue;
            setIsThumbIndex(0);
          }
        }

        setValue(values);
        onChange?.(event, values);
      } else {
        // Single slider
        setValue(newValue);
        onChange?.(event, newValue);
      }
    },
    [getClickedPosition, setValue, onChange, sliderValue],
  );

  const handlePointerMove = (event: PointerEvent) =>
    calculateAndSetThumbPosition(event);

  const handlePointerUp = () => setIsDragging(false);

  return {
    calculateAndSetThumbPosition,
    calculatePercentage,
    clamp,
    clampRange,
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    preventThumbOverlap,
    isDragging,
    sliderRef,
    thumbIndexState,
  };
};

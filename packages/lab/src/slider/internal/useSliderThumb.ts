import {
  type Dispatch,
  type SetStateAction,
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
    event: MouseEvent | React.MouseEvent,
    value: number | [number, number],
  ) => void;
  valueState: number | [number, number];
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [thumbIndexState, setIsThumbIndex] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const calculatePercentage = (value: number) =>
    ((value - min) / (max - min)) * 100;

  const clamp = (value: number) => {
    return Number.isNaN(value) ? min : Math.min(Math.max(value, min), max);
  };

  const clampRange = (range: [number, number]): [number, number] => {
    let [start, end] = range;

    if (Number.isNaN(start)) {
      start = min;
    }
    if (Number.isNaN(end)) {
      end = max;
    }
    // Ensure start is not greater than end
    if (start > end) {
      [start, end] = [end, start];
    }
    // Clamp both start and end within the min and max range
    start = Math.min(Math.max(start, min), max);
    end = Math.min(Math.max(end, min), max);

    return [start, end];
  };

  const preventThumbOverlap = (
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
  };

  const sliderValue = Array.isArray(valueState)
    ? clampRange(valueState)
    : clamp(valueState);

  const getClickedPosition = (clientX: number) => {
    if (!sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const rawValue =
      ((clientX - sliderRect.left) / sliderRect.width) * (max - min) + min;
    const steppedValue = Math.round(rawValue / step) * step;
    return clamp(steppedValue);
  };

  const calculateAndSetThumbPosition = (
    event: MouseEvent | React.MouseEvent,
  ) => {
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
  };

  // ******* Event Handlers ***********

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
    thumbIndex?: number,
  ) => {
    setIsDragging(true);
    const newValue = getClickedPosition(event.clientX);
    if (newValue === undefined) return;

    // Range slider
    if (Array.isArray(sliderValue)) {
      const values = [...sliderValue] as [number, number];
      // Find nearest thumb if clicked on slider track
      if (!thumbIndex) {
        const distanceToThumb0 = Math.abs(newValue - values[0]);
        const distanceToThumb1 = Math.abs(newValue - values[1]);

        if (distanceToThumb0 > distanceToThumb1) {
          values[1] = newValue;
          setIsThumbIndex(1);
        } else {
          values[0] = newValue;
          setIsThumbIndex(0);
        }
      } else {
        values[thumbIndex] = newValue;
      }
      setValue(values);
      onChange?.(event, values);
    } else {
      // Single slider
      setValue(newValue);
      onChange?.(event, newValue);
    }
  };

  const handleMouseMove = (event: MouseEvent) =>
    calculateAndSetThumbPosition(event);

  const handleMouseUp = () => setIsDragging(false);

  return {
    calculateAndSetThumbPosition,
    calculatePercentage,
    clamp,
    clampRange,
    handleMouseDown,
    preventThumbOverlap,
    isDragging,
    sliderRef,
    thumbIndexState,
  };
};

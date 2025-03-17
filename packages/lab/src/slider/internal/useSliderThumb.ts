import { useWindow } from "@salt-ds/window";
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SliderProps } from "../Slider";
import { getClickedPosition, getKeyboardValue } from "./utils";

type UseSliderThumbProps = Pick<SliderProps, "min" | "max" | "step"> & {
  decimalPlaces: number;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  marks?: { label: string; value: number }[];
  onChange?: (event: SyntheticEvent<unknown> | Event, value: number) => void;
  onChangeEnd?: (event: SyntheticEvent<unknown> | Event, value: number) => void;
  restrictToMarks?: boolean;
  setValue: Dispatch<SetStateAction<number>>;
  stepMultiplier: number;
  value: number;
};

export const useSliderThumb = ({
  decimalPlaces,
  handleInputChange,
  marks,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  onChangeEnd,
  restrictToMarks,
  setValue,
  stepMultiplier,
  value,
}: UseSliderThumbProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastValueRef = useRef<number>(value);
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
        decimalPlaces,
        marks,
        restrictToMarks,
      );
      if (newValue === undefined || lastValueRef.current === newValue) {
        return;
      }
      lastValueRef.current = newValue;
      setValue(newValue);
      onChange?.(event, newValue);
    },
    [decimalPlaces, marks, max, min, onChange, setValue, restrictToMarks, step],
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
        decimalPlaces,
        marks,
        restrictToMarks,
      );
      if (newValue === undefined || lastValueRef.current === newValue) {
        return;
      }
      lastValueRef.current = newValue;
      setValue(newValue);
      onChange?.(event, newValue);
    },
    [decimalPlaces, marks, max, min, onChange, restrictToMarks, setValue, step],
  );

  const handleKeydownOnThumb = (event: React.KeyboardEvent) => {
    const newValue = getKeyboardValue(
      event,
      value,
      step,
      stepMultiplier,
      max,
      min,
      restrictToMarks,
      marks,
    );

    handleInputChange({
      target: { value: newValue.toString() },
    } as ChangeEvent<HTMLInputElement>);
  };

  return {
    handleKeydownOnThumb,
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    sliderRef,
  };
};

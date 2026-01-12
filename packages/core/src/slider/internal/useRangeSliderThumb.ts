import { useWindow } from "@salt-ds/window";
import {
  type ChangeEvent,
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SliderProps } from "../Slider";
import { getClickedPosition, getKeyboardValue } from "./utils";

type UseRangeSliderThumbProps = Pick<SliderProps, "min" | "max" | "step"> & {
  decimalPlaces: number;
  handleInputChange: (
    event: ChangeEvent<HTMLInputElement>,
    thumbIndex: number,
  ) => void;
  inputRefs: RefObject<HTMLInputElement>[];
  marks?: { label: string; value: number }[];
  onChange?: (event: Event, value: [number, number]) => void;
  onChangeEnd?: (event: Event, value: [number, number]) => void;
  restrictToMarks?: boolean;
  setValue: Dispatch<SetStateAction<[number, number]>>;
  stepMultiplier: number;
  value: [number, number];
};

export const useRangeSliderThumb = ({
  decimalPlaces,
  handleInputChange,
  inputRefs,
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
}: UseRangeSliderThumbProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [thumbIndexState, setIsThumbIndex] = useState<number>(0);
  const lastValueRef = useRef<[number, number]>(value);
  const sliderRef = useRef<HTMLDivElement>(null);
  const targetWindow = useWindow();

  const preventThumbOverlap = useCallback(
    (currentValue: number, value: [number, number], thumbIndex: number) => {
      const values = [...value] as [number, number];
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
        decimalPlaces,
        marks,
        restrictToMarks,
      );
      if (newValue === undefined) return;
      const newValues = preventThumbOverlap(
        newValue,
        value as [number, number],
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
      decimalPlaces,
      marks,
      max,
      min,
      step,
      preventThumbOverlap,
      restrictToMarks,
      value,
      thumbIndexState,
      setValue,
      onChange,
    ],
  );

  const handleDragEnd = useCallback(
    (event: Event) => {
      setIsDragging(false);
      setIsFocusVisible(false);
      onChangeEnd?.(event, lastValueRef.current);
    },
    [onChangeEnd],
  );

  useEffect(() => {
    if (isDragging) {
      targetWindow?.addEventListener("pointermove", handlePointerMove);
      targetWindow?.addEventListener("pointerup", handleDragEnd);
      targetWindow?.addEventListener("pointercancel", handleDragEnd);
      targetWindow?.addEventListener("blur", handleDragEnd);
      targetWindow?.addEventListener("contextmenu", handleDragEnd);
    } else {
      targetWindow?.removeEventListener("pointermove", handlePointerMove);
      targetWindow?.removeEventListener("pointerup", handleDragEnd);
      targetWindow?.removeEventListener("pointercancel", handleDragEnd);
      targetWindow?.removeEventListener("blur", handleDragEnd);
      targetWindow?.removeEventListener("contextmenu", handleDragEnd);
    }
    return () => {
      targetWindow?.removeEventListener("pointermove", handlePointerMove);
      targetWindow?.removeEventListener("pointerup", handleDragEnd);
      targetWindow?.removeEventListener("pointercancel", handleDragEnd);
      targetWindow?.removeEventListener("blur", handleDragEnd);
      targetWindow?.removeEventListener("contextmenu", handleDragEnd);
    };
  }, [isDragging, targetWindow, handlePointerMove, handleDragEnd]);

  const handlePointerDownOnThumb = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, thumbIndex: number) => {
      event.preventDefault();
      // To prevent the pointerdown event from bubbling up to the slider track
      //  and triggering its pointerdown event
      event.stopPropagation();

      inputRefs[thumbIndex].current?.focus();
      setIsDragging(true);
      setIsFocusVisible(false);
      if (thumbIndex !== undefined) {
        setIsThumbIndex(thumbIndex);
      }
    },
    [inputRefs],
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
      let closestThumbIndex = 0;

      if (newValue === undefined) return;
      const newValues = [...value] as [number, number];
      // Find nearest thumb
      const distanceToThumb0 = Math.abs(newValue - newValues[0]);
      const distanceToThumb1 = Math.abs(newValue - newValues[1]);
      if (distanceToThumb0 > distanceToThumb1) {
        // Move the second thumb
        newValues[1] = newValue;
        closestThumbIndex = 1;
      } else if (distanceToThumb0 < distanceToThumb1) {
        // Move the first thumb
        newValues[0] = newValue;
        closestThumbIndex = 0;
      } else {
        // If distances are equal, determine based on the click position
        if (newValue < newValues[0]) {
          // Clicked position is before both thumbs, move the first thumb
          newValues[0] = newValue;
          closestThumbIndex = 0;
        } else if (newValue > newValues[1]) {
          // Clicked position is after both thumbs, move the second thumb
          newValues[1] = newValue;
          closestThumbIndex = 1;
        } else {
          // Clicked position is between the thumbs, move the first thumb
          newValues[0] = newValue;
          closestThumbIndex = 0;
        }
      }
      setIsThumbIndex(closestThumbIndex);
      inputRefs[closestThumbIndex].current?.focus();
      setIsFocusVisible(false);

      if (
        newValues[0] !== lastValueRef.current[0] ||
        newValues[1] !== lastValueRef.current[1]
      ) {
        lastValueRef.current = newValues;
        setValue(newValues);
        onChange?.(event.nativeEvent, newValues);
      }
    },
    [
      decimalPlaces,
      marks,
      value,
      max,
      min,
      inputRefs,
      onChange,
      restrictToMarks,
      setValue,
      step,
    ],
  );

  const handleKeydownOnThumb = useCallback(
    (event: React.KeyboardEvent, thumbIndex: number) => {
      const newValue = getKeyboardValue(
        event,
        value[thumbIndex],
        step,
        stepMultiplier,
        max,
        min,
        restrictToMarks,
        marks,
      );
      if (
        newValue === undefined ||
        newValue === lastValueRef.current[thumbIndex]
      ) {
        return;
      }
      setIsFocusVisible(true);
      lastValueRef.current[thumbIndex] = newValue;
      handleInputChange(
        {
          target: { value: newValue.toString() },
        } as ChangeEvent<HTMLInputElement>,
        thumbIndex,
      );
    },
    [
      value,
      step,
      stepMultiplier,
      max,
      min,
      restrictToMarks,
      marks,
      handleInputChange,
    ],
  );

  const handleFocus = (thumbIndex: number) => {
    setIsThumbIndex(thumbIndex);
    setIsFocusVisible(true);
  };

  const handleBlur = (thumbIndex: number) => {
    setIsThumbIndex(thumbIndex);
    setIsFocusVisible(false);
  };

  return {
    handleBlur,
    handleFocus,
    handleKeydownOnThumb,
    handlePointerDownOnThumb,
    handlePointerDownOnTrack,
    isDragging,
    isFocusVisible,
    preventThumbOverlap,
    sliderRef,
    thumbIndexState,
  };
};

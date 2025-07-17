import {
  type Dispatch,
  type MouseEvent,
  type MutableRefObject,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
} from "react";
import { useActivateWhileMouseDown } from "./internal/useActivateWhileMouseDown";
import { toFloat } from "./internal/utils";
import type { NumberInputProps } from "./NumberInput";

export interface UseNumberInputProps
  extends Pick<
    NumberInputProps,
    | "decimalScale"
    | "disabled"
    | "format"
    | "inputRef"
    | "max"
    | "min"
    | "onChange"
    | "parse"
    | "readOnly"
    | "step"
    | "stepMultiplier"
  > {
  clampAndFix: (value: number) => string | number;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  isAdjustingRef: MutableRefObject<boolean>;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setValue: Dispatch<SetStateAction<string | number>>;
  value: string | number;
}

/**
 * Manages increment / decrement logic
 */
export const useNumberInput = ({
  clampAndFix,
  decimalScale,
  disabled,
  format,
  inputRef,
  isAdjustingRef,
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  onChange,
  parse,
  readOnly,
  setIsEditing,
  setValue,
  step = 1,
  stepMultiplier = 2,
  value,
}: UseNumberInputProps) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Refs cannot be added to dependency arrays
  const updateValue = useCallback(
    (event: SyntheticEvent | undefined, nextValue: number) => {
      if (readOnly) return;
      isAdjustingRef.current = true;

      const updatedValue = clampAndFix(nextValue);
      setValue(toFloat(updatedValue));
      onChange?.(event, toFloat(updatedValue));
    },
    [onChange, readOnly, setValue, decimalScale, format],
  );

  const decrementValue = useCallback(
    (event?: SyntheticEvent, block?: boolean) => {
      const decrementStep = block ? stepMultiplier * step : step;
      const parsedValue = parse?.(value) || value;
      const nextValue = toFloat(parsedValue) - decrementStep;
      if (nextValue < min) return;
      updateValue(event, nextValue);
    },
    [value, min, step, stepMultiplier, updateValue, parse],
  );

  const incrementValue = useCallback(
    (event?: SyntheticEvent, block?: boolean) => {
      const incrementStep = block ? stepMultiplier * step : step;
      const parsedValue = parse?.(value) || value;
      const nextValue = toFloat(parsedValue) + incrementStep;
      if (nextValue > max) return;
      updateValue(event, nextValue);
    },
    [value, max, step, stepMultiplier, updateValue, parse],
  );

  const { activate: decrementSpinner } = useActivateWhileMouseDown(
    (event?: SyntheticEvent) => decrementValue(event),
    toFloat(value) <= min,
  );

  const { activate: incrementSpinner } = useActivateWhileMouseDown(
    (event?: SyntheticEvent) => incrementValue(event),
    toFloat(value) >= max,
  );

  const handleButtonMouseUp = () => inputRef.current?.focus();

  const commonButtonProps = {
    "aria-hidden": true,
    tabIndex: -1,
    onMouseUp: handleButtonMouseUp,
  };

  const incrementButtonProps = {
    ...commonButtonProps,
    "aria-label": "increment value",
    disabled: disabled || toFloat(value) + step > max,
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setIsEditing(true);
      if (event.nativeEvent.button !== 0) {
        // To match closely with <input type='input'>
        return;
      }
      incrementSpinner(event);
    },
  };

  const decrementButtonProps = {
    ...commonButtonProps,
    "aria-label": "decrement value",
    disabled: disabled || toFloat(value) - step < min,
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setIsEditing(true);
      if (event.nativeEvent.button !== 0) {
        // To match closely with <input type='input'>
        return;
      }
      decrementSpinner(event);
    },
  };

  return {
    incrementButtonProps,
    decrementButtonProps,
    incrementValue,
    decrementValue,
  };
};

import {
  type Dispatch,
  type MouseEvent,
  type MutableRefObject,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
} from "react";
import type { NumberInputProps } from "./NumberInput";
import { useActivateWhileMouseDown } from "./internal/useActivateWhileMouseDown";
import {
  isAtMax,
  isAtMin,
  parseAndFormat,
  sanitizeInput,
} from "./internal/utils";

/**
 * Manages increment / decrement logic
 */
export const useNumberInput = ({
  decimalPlaces = 0,
  disabled,
  inputRef,
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  onChange,
  readOnly,
  setValue,
  step = 1,
  stepMultiplier = 2,
  value,
  format,
}: Pick<
  NumberInputProps,
  | "decimalPlaces"
  | "disabled"
  | "inputRef"
  | "max"
  | "min"
  | "onChange"
  | "readOnly"
  | "step"
  | "stepMultiplier"
> & {
  setValue: Dispatch<SetStateAction<string | number>>;
  value: string | number;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  format?: (value: number | string) => number | string;
}) => {
  const updateValue = useCallback(
    (event: SyntheticEvent | undefined, nextValue: number) => {
      if (readOnly) return;

      const clampedValue = clamp(nextValue);
      const formattedValue = parseAndFormat(
        decimalPlaces,
        clampedValue,
        format,
      );
      setValue(formattedValue);
      onChange?.(event, formattedValue);
    },
    [decimalPlaces, onChange, readOnly, setValue, format],
  );

  const clamp = (value: number) => {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  };

  const decrementValue = useCallback(
    (event?: SyntheticEvent, block?: boolean) => {
      if (isAtMin(value, min)) return;
      const decrementStep = block ? stepMultiplier * step : step;
      const sanitizedValue = sanitizeInput(value);
      const nextValue = sanitizedValue - decrementStep;

      updateValue(event, nextValue);
    },
    [value, min, step, stepMultiplier, updateValue],
  );

  const incrementValue = useCallback(
    (event?: SyntheticEvent, block?: boolean) => {
      if (isAtMax(value, max)) return;
      const incrementStep = block ? stepMultiplier * step : step;
      const sanitizedValue = sanitizeInput(value);
      const nextValue = sanitizedValue + incrementStep;

      updateValue(event, nextValue);
    },
    [value, max, step, stepMultiplier, updateValue],
  );

  const { activate: decrementSpinner } = useActivateWhileMouseDown(
    (event?: SyntheticEvent) => decrementValue(event),
    isAtMin(value, min),
  );

  const { activate: incrementSpinner } = useActivateWhileMouseDown(
    (event?: SyntheticEvent) => incrementValue(event),
    isAtMax(value, max),
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
    disabled: disabled || isAtMax(value, max),
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
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
    disabled: disabled || isAtMin(value, min),
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
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

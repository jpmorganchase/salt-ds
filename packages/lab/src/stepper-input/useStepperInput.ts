import {
  type Dispatch,
  type MouseEvent,
  type MutableRefObject,
  type SetStateAction,
  type SyntheticEvent,
  useCallback,
} from "react";
import type { StepperInputProps } from "./StepperInput";
import { useActivateWhileMouseDown } from "./internal/useActivateWhileMouseDown";
import {
  isAtMax,
  isAtMin,
  toFixedDecimalPlaces,
  toFloat,
} from "./internal/utils";

/**
 * Manages increment / decrement logic
 */
export const useStepperInput = ({
  decimalPlaces = 0,
  disabled,
  inputRef,
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  onChange,
  readOnly,
  setValue,
  step = 1,
  stepBlock = 10,
  value,
}: Pick<
  StepperInputProps,
  | "decimalPlaces"
  | "disabled"
  | "inputRef"
  | "max"
  | "min"
  | "onChange"
  | "readOnly"
  | "step"
  | "stepBlock"
  | "value"
> & {
  setValue: Dispatch<SetStateAction<string | number | undefined>>;
  inputRef: MutableRefObject<HTMLInputElement | null>;
}) => {
  const setValueInRange = useCallback(
    (event: SyntheticEvent | undefined, modifiedValue: number) => {
      if (readOnly) return;
      let nextValue = modifiedValue;
      if (nextValue < min) nextValue = min;
      if (nextValue > max) nextValue = max;

      const roundedValue = toFixedDecimalPlaces(nextValue, decimalPlaces);
      if (Number.isNaN(toFloat(roundedValue))) return;

      setValue(roundedValue);

      onChange?.(event, roundedValue);
    },
    [decimalPlaces, min, max, onChange, readOnly, setValue],
  );

  const decrementValue = useCallback(
    (event?: SyntheticEvent, block?: boolean) => {
      if (value === undefined || isAtMin(value, min)) return;
      const decrementStep = block ? stepBlock : step;
      const nextValue =
        value === "" ? -decrementStep : toFloat(value) - decrementStep;
      setValueInRange(event, nextValue);
    },
    [value, min, step, stepBlock, setValueInRange],
  );

  const incrementValue = useCallback(
    (event?: SyntheticEvent, block?: boolean) => {
      if (value === undefined || isAtMax(value, max)) return;
      const incrementStep = block ? stepBlock : step;
      const nextValue =
        value === "" ? incrementStep : toFloat(value) + incrementStep;
      setValueInRange(event, nextValue);
    },
    [value, max, step, stepBlock, setValueInRange],
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

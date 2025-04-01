import {
  type MouseEvent,
  type MutableRefObject,
  type SyntheticEvent,
  useCallback,
} from "react";
import { NumberFormatBaseProps } from "react-number-format";
import type { NumberInputProps } from "./NumberInput";
import { useActivateWhileMouseDown } from "./internal/useActivateWhileMouseDown";
import {
  getDecimalPlaces,
  canDecrement,
  canIncrement,
  isNumberString,
} from "./internal/utils";

export type useNumberInputProps = Pick<
  NumberInputProps,
  "defaultStartValue" | "disabled" | "max" | "min" | "onValueChange" | "step"
> & {
  format: NumberFormatBaseProps["format"] | null | undefined;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  value: string | number | undefined;
};

type SourceOfChange = "keyboard" | "increment" | "decrement";

export const useNumberInput = ({
  defaultStartValue = 0,
  disabled,
  format,
  inputRef,
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  onValueChange,
  step: stepProp = 1,
  value = "",
}: useNumberInputProps) => {
  const isDecrementDisabled =
    disabled ||
    (typeof value === "number" && min !== undefined && value <= min);
  const isIncrementDisabled =
    disabled ||
    (typeof value === "number" && max !== undefined && value >= max);

  const updateValue = useCallback(
    (newValue: number, source: SourceOfChange) => {
      const decimalPlaces = getDecimalPlaces(newValue);
      const fixedValue = newValue.toFixed(decimalPlaces);
      const formattedValue = format?.(fixedValue) ?? fixedValue;
      const floatValue = Number.parseFloat(formattedValue);

      onValueChange?.(
        {
          floatValue,
          formattedValue: formattedValue.toString(),
          value: formattedValue.toString(),
        },
        { source: source as any },
      );
    },
    [onValueChange],
  );

  const setNumber = useCallback(
    (
      _event: SyntheticEvent | undefined,
      newValue: number,
      source: SourceOfChange,
    ) => {
      const maxPrecision = Math.max(
        getDecimalPlaces(value),
        getDecimalPlaces(newValue),
      );
      const factor = 10 ** maxPrecision;
      let val: number;

      if (
        !isNumberString(value) &&
        (typeof value !== "number" || Number.isNaN(value))
      ) {
        val = defaultStartValue;
      } else {
        // Scale the newValue to an integer
        val = Math.round(newValue * factor) / factor;
      }

      // Ensure the value is within the min and max bounds
      val = Math.min(Math.max(val, min), max);
      updateValue(val, source);
    },
    [value, defaultStartValue, min, max, updateValue],
  );

  const spinHandler = useCallback(
    (
      _event: SyntheticEvent | undefined,
      step: number = stepProp,
      source: SourceOfChange,
    ) => {
      const maxPrecision = Math.max(
        getDecimalPlaces(value),
        getDecimalPlaces(step),
      );
      const factor = 10 ** maxPrecision;
      let val: number;

      if (
        (!isNumberString(value) && typeof value !== "number") ||
        Number.isNaN(value)
      ) {
        val = defaultStartValue;
      } else {
        const scaledValue = Math.round(Number(value) * factor);
        const scaledStep = Math.round(step * factor);
        val = scaledValue + scaledStep;
        val = val / factor;
      }
      // Ensure the value is within the min and max bounds
      val = Math.min(Math.max(val, min), max);
      updateValue(val, source);
    },
    [value, defaultStartValue, stepProp, min, max, updateValue],
  );

  const incrementNumber = useCallback(
    (
      event: SyntheticEvent | undefined,
      step: number = stepProp,
      source: SourceOfChange = "increment",
    ) => {
      if (canIncrement(value)) {
        spinHandler(event, step, source);
      }
    },
    [value, stepProp, spinHandler],
  );

  const decrementNumber = useCallback(
    (
      event: SyntheticEvent | undefined,
      step: number = stepProp,
      source: SourceOfChange = "decrement",
    ) => {
      if (canDecrement(value)) {
        spinHandler(event, step * -1, source);
      }
    },
    [value, stepProp, spinHandler],
  );

  const { activate: incrementSpinner } = useActivateWhileMouseDown(
    (event?: SyntheticEvent) => incrementNumber(event),
    isIncrementDisabled,
  );

  const { activate: decrementSpinner } = useActivateWhileMouseDown(
    (event?: SyntheticEvent) => decrementNumber(event),
    isDecrementDisabled,
  );

  const commonButtonProps = {
    "aria-hidden": true,
    tabIndex: -1,
    onMouseUp: () => {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.setSelectionRange(0, input.value.length);
      }
    },
  };

  const incrementButtonProps = {
    ...commonButtonProps,
    "aria-label": "increment value",
    disabled: isIncrementDisabled,
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (event.nativeEvent.button === 0) {
        // To match closely with <input type='input'>
        incrementSpinner(event);
      }
    },
  };

  const decrementButtonProps = {
    ...commonButtonProps,
    "aria-label": "decrement value",
    disabled: isDecrementDisabled,
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (event.nativeEvent.button === 0) {
        // To match closely with <input type='input'>
        decrementSpinner(event);
      }
    },
  };

  return {
    incrementButtonProps,
    decrementButtonProps,
    setNumber,
    incrementNumber,
    decrementNumber,
  };
};

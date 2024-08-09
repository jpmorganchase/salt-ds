import {
  type InputProps,
  useControlled,
  useForkRef,
  useId,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
  useRef,
} from "react";
import type { StepperInputProps } from "./StepperInput";
import { useSpinner } from "./internal/useSpinner";
import {
  isAtMax,
  isAtMin,
  isOutOfRange,
  toFixedDecimalPlaces,
  toFloat,
} from "./internal/utils";

export const useStepperInput = ({
  stepBlock = 10,
  decimalPlaces = 0,
  defaultValue = 0,
  id: idProp,
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  onChange,
  step = 1,
  value,
  readOnly,
  disabled,
  textAlign,
}: Pick<
  StepperInputProps,
  | "stepBlock"
  | "decimalPlaces"
  | "defaultValue"
  | "id"
  | "max"
  | "min"
  | "onChange"
  | "step"
  | "value"
  | "readOnly"
  | "disabled"
  | "textAlign"
>) => {
  const decrement = (event?: SyntheticEvent) => {
    if (value === undefined || isAtMin(value, min)) return;
    const nextValue = value === "" ? -step : toFloat(value) - step;
    setNextValue(event, nextValue);
  };

  const decrementBlock = (event?: SyntheticEvent) => {
    if (value === undefined || isAtMin(value, min)) return;
    const nextValue = value === "" ? stepBlock : toFloat(value) - stepBlock;
    setNextValue(event, nextValue);
  };

  const increment = (event?: SyntheticEvent) => {
    if (value === undefined || isAtMax(value, max)) return;
    const nextValue = value === "" ? step : toFloat(value) + step;
    setNextValue(event, nextValue);
  };

  const incrementBlock = (event?: SyntheticEvent) => {
    if (value === undefined || isAtMax(value, max)) return;
    const nextValue = value === "" ? stepBlock : toFloat(value) + stepBlock;
    setNextValue(event, nextValue);
  };

  const { activate: decrementSpinner, buttonDown: arrowDownButtonDown } =
    useSpinner((event?: SyntheticEvent) => decrement(event), isAtMin());

  const { activate: incrementSpinner, buttonDown: arrowUpButtonDown } =
    useSpinner((event?: SyntheticEvent) => increment(event), isAtMax());

  const handleInputBlur = (event: FocusEvent<HTMLDivElement>) => {
    InputProps?.onBlur?.(event);

    if (currentValue === undefined) return;

    const roundedValue = toFixedDecimalPlaces(
      toFloat(currentValue),
      decimalPlaces,
    );

    if (
      currentValue !== "" &&
      !isAllowedNonNumeric(currentValue) &&
      !isControlled
    ) {
      setCurrentValue(roundedValue);
    }

    if (onChange) {
      onChange(event, roundedValue);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    InputProps?.onChange?.(event);

    const changedValue = event.target.value;

    if (!isControlled) {
      setCurrentValue(sanitizedInput(changedValue));
    }

    if (onChange) {
      onChange(event, sanitizedInput(changedValue));
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    InputProps?.onKeyDown?.(event);
    if (event.shiftKey && ["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      event.key === "ArrowUp" ? incrementBlock() : decrementBlock();
    } else if (["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      event.key === "ArrowUp" ? increment() : decrement();
    }
  };

  const handleButtonMouseDown = (
    event: MouseEvent<HTMLButtonElement>,
    direction: string,
  ) => {
    if (event.nativeEvent.button !== 0) return;
    direction === "increment"
      ? incrementSpinner(event)
      : decrementSpinner(event);
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonMouseUp = () => inputRef.current?.focus();

  const forkedInputRef = useForkRef(inputRef, InputPropsProp.inputRef);

  const getButtonProps = (direction: string) => ({
    "aria-hidden": true,
    disabled: disabled || (direction === "increment" ? isAtMax() : isAtMin()),
    tabIndex: -1,
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) =>
      handleButtonMouseDown(event, direction),
    onMouseUp: handleButtonMouseUp,
  });

  const InputProps: InputProps | undefined =
    currentValue === undefined
      ? undefined
      : {
          ...InputPropsProp,
          inputProps: {
            role: "spinbutton",
            "aria-invalid": isOutOfRange(),
            "aria-valuemax": toFloat(toFixedDecimalPlaces(max, decimalPlaces)),
            "aria-valuemin": toFloat(toFixedDecimalPlaces(min, decimalPlaces)),
            "aria-valuenow": toFloat(
              toFixedDecimalPlaces(toFloat(currentValue), decimalPlaces),
            ),
            id: inputId,
            ...InputPropsProp.inputProps,
          },
          onBlur: handleInputBlur,
          onChange: handleInputChange,
          onKeyDown: handleInputKeyDown,
          textAlign: textAlign ?? InputPropsProp.textAlign,
          value: String(currentValue),
          inputRef: forkedInputRef,
        };

  return {
    decrementButtonDown: arrowDownButtonDown,
    getButtonProps,
    InputProps,
    incrementButtonDown: arrowUpButtonDown,
  };
};

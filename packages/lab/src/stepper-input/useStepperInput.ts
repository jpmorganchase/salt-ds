import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { useControlled, useId, InputProps } from "@salt-ds/core";
import { useSpinner } from "./internal/useSpinner";
import { StepperInputProps } from "./StepperInput";

// The input should only accept numbers, decimal points, and plus/minus symbols
const ACCEPT_INPUT = /^[-+]?[0-9]*\.?([0-9]+)?/g;

const callAll =
  (...fns: any[]) =>
  (...args: any[]) =>
    fns.forEach((fn) => fn && fn(...args));

const toFixedDecimalPlaces = (inputNumber: number, decimalPlaces: number) =>
  inputNumber.toFixed(decimalPlaces);

const isAllowedNonNumeric = (inputCharacter: number | string) => {
  if (typeof inputCharacter === "number") return;
  return (
    ("-+".includes(inputCharacter) && inputCharacter.length === 1) ||
    inputCharacter === ""
  );
};

const toFloat = (inputValue: number | string) => {
  // Plus, minus, and empty characters are treated as 0
  if (isAllowedNonNumeric(inputValue)) return 0;
  return parseFloat(inputValue.toString());
};

const sanitizedInput = (numberString: string) =>
  (numberString.match(ACCEPT_INPUT) || []).join("");

const isIntermediateInput = (numberString: string) => {
  const validNumberPattern = /^[+-]?(?=\d|\.d)\d*\.?\d+$/;
  return !validNumberPattern.test(numberString);
};

export const useStepperInput = (
  props: StepperInputProps,
  inputRef: MutableRefObject<HTMLInputElement | null>
) => {
  const {
    block = 10,
    decimalPlaces = 0,
    defaultValue = 0,
    id: idProp,
    max = Number.MAX_SAFE_INTEGER,
    min = Number.MIN_SAFE_INTEGER,
    onChange,
    step = 1,
    value,
  } = props;

  const [currentValue, setCurrentValue, isControlled] = useControlled({
    controlled: value,
    default: toFixedDecimalPlaces(defaultValue, decimalPlaces),
    name: "stepper-input",
  });

  const [inputValue, setInputValue] = useState(currentValue);

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    if (value != undefined) {
      setInputValue(value);
    }
  }, [value, isControlled]);

  const inputId = useId(idProp);

  const isOutOfRange = () => {
    if (currentValue === undefined) return true;
    return toFloat(currentValue) > max || toFloat(currentValue) < min;
  };

  const isAtMax = () => {
    if (currentValue === undefined) return true;
    return toFloat(currentValue) >= max || (max === 0 && currentValue === "");
  };

  const isAtMin = () => {
    if (currentValue === undefined) return true;
    return toFloat(currentValue) <= min || (min === 0 && currentValue === "");
  };

  const decrement = (event?: SyntheticEvent) => {
    if (currentValue === undefined || isAtMin()) return;
    let nextValue = currentValue === "" ? -step : toFloat(currentValue) - step;

    if (max !== undefined && isOutOfRange()) nextValue = max;

    setNextValue(nextValue, event ? event : undefined);
  };

  const decrementBlock = (event?: SyntheticEvent) => {
    if (currentValue === undefined || isAtMin()) return;
    let nextValue =
      currentValue === ""
        ? block * -step
        : toFloat(currentValue) - step * block;

    if (max !== undefined && isOutOfRange()) nextValue = max;

    setNextValue(nextValue, event);
  };

  const increment = (event?: SyntheticEvent) => {
    if (currentValue === undefined || isAtMax()) return;
    let nextValue = currentValue === "" ? step : toFloat(currentValue) + step;

    if (min !== undefined && isOutOfRange()) nextValue = min;

    setNextValue(nextValue, event);
  };

  const incrementBlock = (event?: SyntheticEvent) => {
    if (currentValue === undefined || isAtMax()) return;
    let nextValue =
      currentValue === "" ? block * step : toFloat(currentValue) + step * block;

    if (min !== undefined && isOutOfRange()) nextValue = min;

    setNextValue(nextValue, event);
  };

  const setNextValue = (modifiedValue: number, event?: SyntheticEvent) => {
    if (props.readOnly) return;
    let nextValue = modifiedValue;
    if (nextValue < min) nextValue = min;
    if (nextValue > max) nextValue = max;

    const roundedValue = toFixedDecimalPlaces(nextValue, decimalPlaces);
    if (isNaN(toFloat(roundedValue))) return;

    if (!isControlled) {
      setCurrentValue(roundedValue);
    }

    if (onChange && event) {
      onChange(event, toFloat(roundedValue));
    }

    setInputValue(roundedValue);
  };

  const { activate: decrementSpinnerBlock, buttonDown: pgDnButtonDown } =
    useSpinner((event?: SyntheticEvent) => decrementBlock(event), isAtMin());

  const { activate: decrementSpinner, buttonDown: arrowDownButtonDown } =
    useSpinner((event?: SyntheticEvent) => decrement(event), isAtMin());

  const { activate: incrementSpinnerBlock, buttonDown: pgUpButtonDown } =
    useSpinner((event?: SyntheticEvent) => incrementBlock(event), isAtMax());

  const { activate: incrementSpinner, buttonDown: arrowUpButtonDown } =
    useSpinner((event?: SyntheticEvent) => increment(event), isAtMax());

  const handleInputBlur = (event: FocusEvent) => {
    if (currentValue === undefined) return;

    const roundedValue = toFixedDecimalPlaces(
      toFloat(currentValue),
      decimalPlaces
    );

    if (
      currentValue !== "" &&
      !isAllowedNonNumeric(currentValue) &&
      !isControlled
    ) {
      setCurrentValue(roundedValue);
    }

    if (onChange) {
      onChange(event, toFloat(roundedValue));
    }
    setInputValue(roundedValue);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (!isControlled) {
      setCurrentValue(sanitizedInput(value));
    }

    if (!isIntermediateInput(value)) {
      if (onChange) {
        onChange(event, toFloat(sanitizedInput(value)));
      }
    }

    setInputValue(value);
  };

  const handleInputKeyDown = (event: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      event.key === "ArrowUp"
        ? incrementSpinner(event)
        : decrementSpinner(event);
    }
    if (["PageUp", "PageDown"].includes(event.key)) {
      event.preventDefault();
      event.key === "PageUp"
        ? incrementSpinnerBlock(event)
        : decrementSpinnerBlock(event);
    }
  };

  const handleButtonMouseDown = (
    event: MouseEvent<HTMLButtonElement>,
    direction: string
  ) => {
    if (event.nativeEvent.button !== 0) return;
    direction === "increment"
      ? incrementSpinner(event)
      : decrementSpinner(event);
  };

  const handleButtonMouseUp = () => inputRef.current?.focus();

  const getButtonProps = (direction: string) => ({
    "aria-hidden": true,
    disabled:
      props.disabled || (direction === "increment" ? isAtMax() : isAtMin()),
    tabIndex: -1,
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) =>
      handleButtonMouseDown(event, direction),
    onMouseUp: handleButtonMouseUp,
  });

  const getInputProps = (
    inputProps: InputProps = {}
  ): InputProps | undefined => {
    if (currentValue === undefined) return undefined;
    return {
      ...inputProps,
      inputProps: {
        role: "spinbutton",
        "aria-invalid": isOutOfRange(),
        "aria-valuemax": toFloat(toFixedDecimalPlaces(max, decimalPlaces)),
        "aria-valuemin": toFloat(toFixedDecimalPlaces(min, decimalPlaces)),
        "aria-valuenow": toFloat(
          toFixedDecimalPlaces(toFloat(currentValue), decimalPlaces)
        ),
        id: inputId,
        ...inputProps.inputProps,
      },
      onBlur: callAll(inputProps.onBlur, handleInputBlur),
      onChange: callAll(inputProps.onChange, handleInputChange),
      onFocus: inputProps.onFocus,
      onKeyDown: callAll(inputProps.onKeyDown, handleInputKeyDown),
      textAlign: inputProps.textAlign,
      value: inputValue,
    };
  };

  return {
    decrementButtonDown: arrowDownButtonDown || pgDnButtonDown,
    getButtonProps,
    getInputProps,
    incrementButtonDown: arrowUpButtonDown || pgUpButtonDown,
  };
};

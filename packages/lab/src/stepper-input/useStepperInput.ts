import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  MutableRefObject,
} from "react";
import { useControlled, useId, InputProps } from "@salt-ds/core";
import { useSpinner } from "./internal/useSpinner";
import { StepperInputProps } from "./StepperInput";

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
  if (isAllowedNonNumeric(inputValue)) return 0;
  return parseFloat(inputValue.toString());
};

const sanitizedInput = (numberString: string) =>
  (numberString.match(ACCEPT_INPUT) || []).join("");

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
    onValueChange,
    step = 1,
    value,
  } = props;

  const [currentValue, setCurrentValue, isControlled] = useControlled({
    controlled: value,
    default: toFixedDecimalPlaces(defaultValue, decimalPlaces),
    name: "stepper-input",
  });
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

  const decrement = (event: KeyboardEvent | MouseEvent) => {
    if (currentValue === undefined || isAtMin()) return;
    let nextValue = currentValue === "" ? -step : toFloat(currentValue) - step;

    if (max !== undefined && isOutOfRange()) nextValue = max;

    setNextValue(nextValue, event);
  };

  const decrementBlock = (event: KeyboardEvent | MouseEvent) => {
    if (currentValue === undefined || isAtMin()) return;
    let nextValue =
      currentValue === ""
        ? block * -step
        : toFloat(currentValue) - step * block;

    if (max !== undefined && isOutOfRange()) nextValue = max;

    setNextValue(nextValue, event);
  };

  const increment = (event: KeyboardEvent | MouseEvent) => {
    if (currentValue === undefined || isAtMax()) return;
    let nextValue = currentValue === "" ? step : toFloat(currentValue) + step;

    if (min !== undefined && isOutOfRange()) nextValue = min;

    setNextValue(nextValue, event);
  };

  const incrementBlock = (event: KeyboardEvent | MouseEvent) => {
    if (currentValue === undefined || isAtMax()) return;
    let nextValue =
      currentValue === "" ? block * step : toFloat(currentValue) + step * block;

    if (min !== undefined && isOutOfRange()) nextValue = min;

    setNextValue(nextValue, event);
  };

  const setNextValue = (
    modifiedValue: number,
    event: KeyboardEvent | MouseEvent
  ) => {
    if (props.readOnly) return;
    let nextValue = modifiedValue;
    if (nextValue < min) nextValue = min;
    if (nextValue > max) nextValue = max;

    const roundedValue = toFixedDecimalPlaces(nextValue, decimalPlaces);
    if (isNaN(toFloat(roundedValue))) return;

    if (!isControlled) {
      setCurrentValue(roundedValue);
    }

    if (onValueChange) {
      onValueChange(event, toFloat(roundedValue));
    }
  };

  const { activate: decrementSpinnerBlock, buttonDown: pgDnButtonDown } =
    useSpinner((event: KeyboardEvent) => decrementBlock(event), isAtMin());

  const { activate: decrementSpinner, buttonDown: arrowDownButtonDown } =
    useSpinner((event: KeyboardEvent) => decrement(event), isAtMin());

  const { activate: incrementSpinnerBlock, buttonDown: pgUpButtonDown } =
    useSpinner((event: KeyboardEvent) => incrementBlock(event), isAtMax());

  const { activate: incrementSpinner, buttonDown: arrowUpButtonDown } =
    useSpinner((event: KeyboardEvent) => increment(event), isAtMax());

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

    if (onValueChange) {
      onValueChange(event, toFloat(roundedValue));
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const changedValue = event.target.value;

    if (!isControlled) {
      setCurrentValue(sanitizedInput(changedValue));
    }

    if (onValueChange) {
      onValueChange(event, toFloat(sanitizedInput(changedValue)));
    }
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
      value: String(currentValue),
    };
  };

  return {
    decrementButtonDown: arrowDownButtonDown || pgDnButtonDown,
    getButtonProps,
    getInputProps,
    incrementButtonDown: arrowUpButtonDown || pgUpButtonDown,
  };
};

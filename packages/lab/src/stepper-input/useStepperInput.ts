import { ButtonProps, useControlled, useId } from "@jpmorganchase/uitk-core";
import { KeyboardEvent, MouseEvent, MutableRefObject } from "react";
import { InputProps } from "../input";
import { useDynamicAriaLabel } from "./internal/useDynamicAriaLabel";
import { useSpinner } from "./internal/useSpinner";
import { StepperInputProps } from "./StepperInput";

type Direction = "decrement" | "increment";

const stepperDirection = {
  INCREMENT: "increment" as Direction,
  DECREMENT: "decrement" as Direction,
};

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

const santizedInput = (numberString: string) =>
  (numberString.match(ACCEPT_INPUT) || []).join("");

const getButtonIcon = (type: Direction) =>
  type === stepperDirection.INCREMENT ? "triangle-up" : "triangle-down";

export const useStepperInput = (
  props: StepperInputProps,
  inputRef: MutableRefObject<HTMLInputElement | null>
) => {
  const {
    block = 10,
    decimalPlaces = 0,
    defaultValue = 0,
    liveValue,
    max = Number.MAX_SAFE_INTEGER,
    min = Number.MIN_SAFE_INTEGER,
    onChange,
    step = 1,
    value,
    InputProps: inputPropsProp = {},
  } = props;

  const [currentValue, setCurrentValue, isControlled] = useControlled({
    controlled: value,
    default: toFixedDecimalPlaces(defaultValue, decimalPlaces),
    name: "stepper-input",
  });
  const inputId = useId(inputPropsProp.id);

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

  const valuesHaveDiverged = () => {
    if (liveValue === undefined || currentValue === undefined) return false;
    return (
      toFloat(toFixedDecimalPlaces(liveValue, decimalPlaces)) !==
      toFloat(currentValue)
    );
  };

  const { setHasAnnounced } = useDynamicAriaLabel(
    ", value out of date",
    liveValue !== undefined,
    inputRef,
    currentValue,
    valuesHaveDiverged
  );

  const decrement = () => {
    if (currentValue === undefined || isAtMin()) return;
    let nextValue = currentValue === "" ? -step : toFloat(currentValue) - step;

    // Set value to `max` if it's currently out of range
    if (max !== undefined && isOutOfRange()) nextValue = max;

    setNextValue(nextValue);
  };

  const decrementBlock = () => {
    if (currentValue === undefined || isAtMin()) return;
    let nextValue =
      currentValue === ""
        ? block * -step
        : toFloat(currentValue) - step * block;

    // Set value to `max` if it's currently out of range
    if (max !== undefined && isOutOfRange()) nextValue = max;

    setNextValue(nextValue);
  };

  const increment = () => {
    if (currentValue === undefined || isAtMax()) return;
    let nextValue = currentValue === "" ? step : toFloat(currentValue) + step;

    // Set value to `min` if it's currently out of range
    if (min !== undefined && isOutOfRange()) nextValue = min;

    setNextValue(nextValue);
  };

  const incrementBlock = () => {
    if (currentValue === undefined || isAtMax()) return;
    let nextValue =
      currentValue === "" ? block * step : toFloat(currentValue) + step * block;

    // Set value to `min` if it's currently out of range
    if (min !== undefined && isOutOfRange()) nextValue = min;

    setNextValue(nextValue);
  };

  const setNextValue = (modifiedValue: number) => {
    let nextValue = modifiedValue;
    if (nextValue < min) nextValue = min;
    if (nextValue > max) nextValue = max;

    const roundedValue = toFixedDecimalPlaces(nextValue, decimalPlaces);
    if (isNaN(toFloat(roundedValue))) return;

    if (!isControlled) {
      setCurrentValue(roundedValue);
    }

    if (onChange) {
      onChange(roundedValue);
    }
  };

  const { activate: decrementSpinnerBlock, buttonDown: pgDnButtonDown } =
    useSpinner(decrementBlock, isAtMin());

  const { activate: decrementSpinner, buttonDown: arrowDownButtonDown } =
    useSpinner(decrement, isAtMin());

  const { activate: incrementSpinnerBlock, buttonDown: pgUpButtonDown } =
    useSpinner(incrementBlock, isAtMax());

  const { activate: incrementSpinner, buttonDown: arrowUpButtonDown } =
    useSpinner(increment, isAtMax());

  const handleInputBlur = () => {
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
      onChange(roundedValue);
    }
  };

  const handleInputFocus = () => {
    setHasAnnounced(false);
  };

  const handleInputChange = (event: KeyboardEvent) => {
    const changedValue = (event.currentTarget as HTMLInputElement).value;

    if (!isControlled) {
      setCurrentValue(santizedInput(changedValue));
    }

    if (onChange) {
      onChange(santizedInput(changedValue));
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      event.key === "ArrowUp" ? incrementSpinner() : decrementSpinner();
    }
    if (["PageUp", "PageDown"].includes(event.key)) {
      event.preventDefault();
      event.key === "PageUp"
        ? incrementSpinnerBlock()
        : decrementSpinnerBlock();
    }
  };

  const handleButtonMouseDown = (
    event: MouseEvent<HTMLButtonElement>,
    type: Direction = stepperDirection.INCREMENT
  ) => {
    if (event.nativeEvent.button !== 0) return;
    type === stepperDirection.INCREMENT
      ? incrementSpinner()
      : decrementSpinner();
  };

  const handleButtonMouseUp = () => inputRef.current?.focus();

  const refreshCurrentValue = () => {
    const refreshedcurrentValue =
      liveValue !== undefined ? liveValue : defaultValue;
    if (refreshedcurrentValue === undefined) return;

    setCurrentValue(
      toFixedDecimalPlaces(toFloat(refreshedcurrentValue), decimalPlaces)
    );

    inputRef.current?.focus();

    if (onChange) {
      onChange(
        toFixedDecimalPlaces(toFloat(refreshedcurrentValue), decimalPlaces)
      );
    }
  };

  const getButtonProps = (
    type: Direction = stepperDirection.INCREMENT,
    buttonPropsProp: ButtonProps = {}
  ) => ({
    "aria-hidden": true,
    tabIndex: -1,
    ...buttonPropsProp,
    onMouseDown: callAll(
      (event: MouseEvent<HTMLButtonElement>) =>
        handleButtonMouseDown(event, type),
      buttonPropsProp.onMouseDown
    ),
    onMouseUp: callAll(() => handleButtonMouseUp(), buttonPropsProp.onMouseUp),
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
      onFocus: callAll(inputProps.onFocus, handleInputFocus),
      onKeyDown: callAll(inputProps.onKeyPress, handleInputKeyDown),
      value: String(currentValue),
    };
  };

  return {
    decrementButtonDown: arrowDownButtonDown || pgDnButtonDown,
    getButtonIcon,
    getButtonProps,
    getInputProps,
    incrementButtonDown: arrowUpButtonDown || pgUpButtonDown,
    isAtMax,
    isAtMin,
    refreshCurrentValue,
    stepperDirection,
    valuesHaveDiverged,
  };
};

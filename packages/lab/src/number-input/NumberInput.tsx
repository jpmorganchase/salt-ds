import {
  Button,
  Input,
  type InputProps,
  makePrefixer,
  useControlled,
  useForkRef,
  useFormFieldProps,
  useIcon,
} from "@salt-ds/core";
import {
  OnValueChange as ReactNumberFormatOnValueChange,
  NumberFormatValues,
  NumericFormatProps,
  NumberFormatBase,
  NumberFormatBaseProps,
  useNumericFormat,
} from "react-number-format";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import React, {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type Ref,
  forwardRef,
  useRef,
} from "react";
import { isInvalid, isValidNumber } from "./internal/utils";

import numberInputCss from "./NumberInput.css";
import { useNumberInput } from "./useNumberInput";

const withBaseName = makePrefixer("saltNumberInput");

/** Regular expression to match strings representing negative zero
 * "-0", "-0.", "-0.0", "-0.00", "-0.000", etc
 * and positive zero with leading decimal places
 * "0.", "0.0", "0.00", "0.000", etc.
 */
const matchLeadingDecimalZero = /^(0\.0*|-0(\.0*)?)$/;

/** Regular expression to match numbers with leading zeros
 * "01", "006", "00.02"
 * and their negative counterparts
 * "-0010", "-000.293"
 */
const matchLeadingZeros = /^-?0\d+(\.\d+)?\.?$/;

export type NumberInputValueChange = ReactNumberFormatOnValueChange;

export interface NumberInputProps
  extends ComponentPropsWithoutRef<"div">,
    Pick<
      InputProps,
      | "bordered"
      | "disabled"
      | "emptyReadOnlyMarker"
      | "startAdornment"
      | "endAdornment"
      | "placeholder"
      | "readOnly"
      | "textAlign"
      | "validationStatus"
      | "variant"
    > {
  /**
   * Determines whether leading zeros are allowed.
   * If set to `false`, leading zeros are removed when the input value becomes a valid number.
   * Defaults to `true`.
   */
  allowLeadingZeros?: boolean;
  /**
   * Determines whether negative values are allowed.
   * Defaults to `true`.
   */
  allowNegative?: boolean;
  /**
   * Limits the number of digits that can be entered after the decimal point.
   */
  decimalScale?: number;
  /**
   * Character used as a decimal separator.
   * Defaults to `'.'`.
   */
  decimalSeparator?: string;
  /**
   * Default start value.
   * If no default value is provided, the input is empty. This number represents the value
   * the input would start from if the user uses the increment or decrement buttons.
   */
  defaultStartValue?: number;
  /**
   * The default value of the input.
   */
  defaultValue?: string | number;
  /**
   * If set, zeros are added after `decimalSeparator` to match the given `decimalScale`.
   * Defaults to `false`.
   */
  fixedDecimalScale?: boolean;
  format?: NumberFormatBaseProps["format"];
  /**
   * Determines whether the controls are hidden.
   * Defaults to `false`.
   */
  hideControls?: boolean;
  /**
   * Props passed to the Input component
   */
  InputProps?: InputProps;
  /**
   * Optional ref for the input component.
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * A function to validate the input value.
   * If this function returns `false`, the `onChange` will not be called and the input value will not change.
   */
  isAllowed?: (values: NumberFormatValues) => boolean;
  /**
   * The maximum value that can be selected.
   * Defaults to `Number.MAX_SAFE_INTEGER`.
   */
  max?: number;
  /**
   * The minimum value that can be selected.
   * Defaults to `Number.MIN_SAFE_INTEGER`.
   */
  min?: number;
  /**
   * Called when value changes from either increment/decrement buttons or direct input
   */
  onValueChange?: NumberInputValueChange;
  /**
   * Prefix added before the input value.
   */
  prefix?: string;
  /**
   * Formfield, required field
   */
  required?: boolean;
  /**
   * The amount to increment or decrement the value by when using the `NumberInput` buttons or Up Arrow and Down Arrow keys.
   * Defaults to `1`.
   */
  step?: number;
  /**
   * Defines the factor by which the step value is multiplied to determine the maximum increment or decrement when the Shift key
   * is held while pressing the Up Arrow or Down Arrow keys for faster adjustments of the value.
   * Defaults to `2`.
   */
  stepMultiplier?: number;
  /**
   * Suffix added after the input value.
   */
  suffix?: string;
  /**
   * A character used to separate thousands.
   * Can be a string or a boolean.
   */
  thousandSeparator?: string | boolean;
  /**
   * Defines the thousand grouping style.
   * Options are `'thousand'`, `'lakh'`, `'wan'`, or `'none'`.
   */
  thousandsGroupStyle?: "thousand" | "lakh" | "wan" | "none";
  /**
   * The current value of the input.
   */
  value?: string | number;
  valueIsNumericString?: boolean;
}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(
    {
      // NumericFormat props
      allowLeadingZeros,
      allowNegative,
      decimalScale = 0,
      decimalSeparator,
      defaultStartValue = 0,
      defaultValue: defaultValueProp,
      fixedDecimalScale,
      format,
      hideControls,
      isAllowed,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      prefix,
      thousandSeparator,
      thousandsGroupStyle,
      step = 1,
      stepMultiplier = 2,
      suffix,
      value: valueProp,
      // Input props
      bordered,
      className: classNameProp,
      disabled,
      inputRef: inputRefProp,
      emptyReadOnlyMarker = "—",
      endAdornment,
      onChange,
      onKeyDown,
      onValueChange,
      placeholder,
      readOnly,
      required,
      startAdornment,
      textAlign = "left",
      validationStatus: validationStatusProp,
      valueIsNumericString,
      variant = "primary",
      ...restProps
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-number-input",
      css: numberInputCss,
      window: targetWindow,
    });

    const { IncreaseIcon, DecreaseIcon } = useIcon();

    const formatRef = useRef<NumberFormatBaseProps["format"] | null>(null);
    const lastChangeValueRef = useRef<NumberFormatValues | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const forkedInputRef = useForkRef(inputRef, inputRefProp);

    const { validationStatus: formFieldValidationStatus } = useFormFieldProps();

    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValueProp,
      name: "NumberInput",
      state: "value",
    });

    const handleValueChange: NumberInputValueChange = (payload, sourceInfo) => {
      const newValue =
        isValidNumber(payload.floatValue, payload.value) &&
        !matchLeadingDecimalZero.test(payload.value) &&
        !(allowLeadingZeros ? matchLeadingZeros.test(payload.value) : false)
          ? payload.floatValue
          : payload.value;

      if (
        ["event", "increment", "decrement", "keyboard"].includes(
          sourceInfo.source as any,
        )
      ) {
        setValue(newValue);
      }
      if (
        payload.formattedValue !== lastChangeValueRef.current?.formattedValue ||
        payload.floatValue !== lastChangeValueRef.current?.floatValue ||
        payload.value !== lastChangeValueRef.current?.value
      ) {
        onValueChange?.(payload, sourceInfo);
      }
      lastChangeValueRef.current = payload;
    };

    const {
      decrementButtonProps,
      incrementButtonProps,
      incrementNumber,
      decrementNumber,
      setNumber,
    } = useNumberInput({
      defaultStartValue,
      disabled: disabled || readOnly,
      format: formatRef?.current,
      inputRef,
      max,
      min,
      onValueChange: handleValueChange,
      step,
      value,
    });

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          incrementNumber(
            event,
            event.shiftKey ? stepMultiplier : step,
            "keyboard",
          );
          break;
        case "ArrowDown":
          event.preventDefault();
          decrementNumber(
            event,
            event.shiftKey ? stepMultiplier : step,
            "keyboard",
          );
          break;
        case "Home":
          event.preventDefault();
          setNumber(event, min, "keyboard");
          break;
        case "End":
          event.preventDefault();
          setNumber(event, max, "keyboard");
          break;
        case "PageUp":
          event.preventDefault();
          incrementNumber(event, stepMultiplier * step, "keyboard");
          break;
        case "PageDown":
          event.preventDefault();
          decrementNumber(event, stepMultiplier * step, "keyboard");
          break;
      }
      onKeyDown?.(event);
    };

    const ariaInvalid = typeof value === "number" && isInvalid(value, min, max);
    const ariaValueMin =
      typeof max === "number" && !Number.isNaN(min)
        ? Number.parseFloat(Math.abs(min).toFixed(decimalScale)) * Math.sign(min)
        : undefined;
    const ariaValueMax =
      typeof max === "number" && !Number.isNaN(max)
        ? Number.parseFloat(Math.abs(max).toFixed(decimalScale)) * Math.sign(max)
        : undefined;
    const ariaValueNow =
      typeof value === "number" && !Number.isNaN(value)
        ? Number.parseFloat(Math.abs(value).toFixed(decimalScale)) * Math.sign(value)
        : undefined;

    const NumericFormatBaseProps: NumericFormatProps & InputProps = {
      "aria-invalid":
        !readOnly &&
        (ariaInvalid ||
          validationStatusProp ||
          formFieldValidationStatus === "error")
          ? "true"
          : "false",
      "aria-valuemax": !readOnly ? ariaValueMax : undefined,
      "aria-valuemin": !readOnly ? ariaValueMin : undefined,
      "aria-valuenow": !readOnly ? ariaValueNow : undefined,
      allowLeadingZeros,
      allowNegative,
      className: withBaseName("input"),
      customInput: Input,
      decimalScale,
      decimalSeparator,
      disabled: disabled,
      endAdornment,
      fixedDecimalScale,
      isAllowed,
      onChange,
      onValueChange: handleValueChange,
      onKeyDown: handleInputKeyDown,
      prefix,
      suffix,
      textAlign,
      thousandSeparator,
      thousandsGroupStyle,
      value,
      // Salt props
      "aria-readonly": readOnly ? "true" : undefined,
      bordered,
      emptyReadOnlyMarker,
      inputRef: forkedInputRef,
      placeholder,
      readOnly,
      required,
      role: readOnly ? "textbox" : "spinbutton",
      startAdornment,
      tabIndex: disabled ? -1 : 0,
      validationStatus: validationStatusProp || formFieldValidationStatus,
      valueIsNumericString,
      variant,
    };

    /* Extract the formatter, so we can use it for increment/decrement onValueChange events */
    const { format: formatCallback, ...numberFormatRest } = useNumericFormat(
      NumericFormatBaseProps,
    );
    formatRef.current = format ?? formatCallback;

    return (
      <div
        className={clsx(withBaseName(), classNameProp, {
          [withBaseName("disabled")]: disabled,
          [withBaseName("readOnly")]: readOnly,
          [withBaseName("bordered")]: bordered,
        })}
        {...restProps}
        ref={ref}
      >
        <NumberFormatBase {...numberFormatRest} format={formatRef.current} />
        {!hideControls && !readOnly && (
          <div className={withBaseName("buttonContainer")}>
            <Button
              className={clsx(
                withBaseName("numberButton"),
                withBaseName("numberButtonIncrement"),
              )}
              {...incrementButtonProps}
            >
              <IncreaseIcon aria-hidden />
            </Button>
            <Button
              className={clsx(
                withBaseName("numberButton"),
                withBaseName("numberButtonDecrement"),
              )}
              {...decrementButtonProps}
            >
              <DecreaseIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
    );
  },
);

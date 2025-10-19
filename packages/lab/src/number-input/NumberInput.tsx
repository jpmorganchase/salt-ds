import {
  Button,
  capitalize,
  makePrefixer,
  StatusAdornment,
  useControlled,
  useForkRef,
  useFormFieldProps,
  useIcon,
  useId,
  type ValidationStatus,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useActivateWhileMouseDown } from "./internal/useActivateWhileMouseDown";
import numberInputCss from "./NumberInput.css";

const withBaseName = makePrefixer("saltNumberInput");

export interface NumberInputProps
  extends Omit<
    ComponentPropsWithoutRef<"div">,
    "onChange" | "defaultValue" | "value"
  > {
  /**
   * Styling variant with full border.
   * @default false
   */
  bordered?: boolean;
  /**
   * A boolean that, when true, ensures the input value is clamped within the specified min and max range upon losing focus.
   * @default false
   */
  clamp?: boolean;
  /**
   * The number of decimal places allowed. Defaults to the decimal scale of either the initial value provided or the step, whichever is greater.
   */
  decimalScale?: number;
  /**
   * The default value. Use when the component is uncontrolled.
   */
  defaultValue?: number | string;
  /**
   * Disable the `NumberInput`.
   * @default false
   */
  disabled?: boolean;
  /**
   * The marker to use in an empty read only Input.
   * @default "—"
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component.
   */
  endAdornment?: ReactNode;
  /**
   * A callback to format the value of the `NumberInput`.
   * value : string
   */
  format?: (value: string) => string;
  /**
   * Hide the number buttons.
   * @default false
   */
  hideButtons?: boolean;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Optional ref for the input component.
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Callback that matches on values as you type and determines whether the value can be entered.
   */
  pattern?: (inputValue: string) => boolean;
  /**
   * The maximum value that can be selected.
   * @default Number.MAX_SAFE_INTEGER
   */
  max?: number;
  /**
   * The minimum value that can be selected.
   * @default Number.MIN_SAFE_INTEGER
   */
  min?: number;
  /**
   * Callback function that is triggered when the value changes via user input or increment/decrement.
   * Use `onNumberChange` if you want stable number, after blur or through increment/decrement
   *
   * @param event - The event that triggers the value change, can be null if called by long-press of increment/decrement
   * @param value - value as string
   */
  onChange?: (event: SyntheticEvent | null, value: string) => void;
  /**
   * Callback function that is triggered when the value changes via increment/decrement or on blur.
   *
   * @param event - The event that triggers the change, can be null if called by long-press of increment/decrement
   * @param value - The committed, parsed number value or null if an empty value
   */
  onNumberChange?: (event: SyntheticEvent | null, value: number | null) => void;
  /**
   *
   * A callback to parse the value of the `NumberInput`. To be used alongside the `format` callback.
   * Return null if you want the NumberInput to be empty.
   */
  parse?: (value: string) => number | null;
  /**
   * A string displayed in a dimmed color when the `NumberInput` value is empty.
   */
  placeholder?: string;
  /**
   * A boolean property that controls the read-only state of the `NumberInput`.
   * - When set to `true`, the `NumberInput` becomes read-only, preventing user edits.
   * - When set to `false` or omitted, the `NumberInput` is editable by the user.
   */
  readOnly?: boolean;
  /**
   * Start adornment component.
   */
  startAdornment?: ReactNode;
  /**
   * The amount to increment or decrement the value by when using the `NumberInput` buttons or Up Arrow and Down Arrow keys.
   * @default 1
   */
  step?: number;
  /**
   * Defines the factor by which the step value is multiplied to determine the maximum increment or decrement when the Shift key
   * is held while pressing the Up Arrow or Down Arrow keys for faster adjustments of the value.
   * @default 2
   */
  stepMultiplier?: number;
  /**
   * Specifies the alignment of the text within the `NumberInput`.
   *
   * @default "left"
   */
  textAlign?: "left" | "center" | "right";
  /**
   * Validation status.
   */
  validationStatus?: Extract<ValidationStatus, "error" | "warning" | "success">;
  /**
   * Styling variant.
   * @default "primary"
   */
  variant?: "primary" | "secondary";
  /**
   * Value of the `NumberInput`, to be used when in a controlled state.
   */
  value?: number | string;
}

export const isOutOfRange = (
  value: number | string,
  min: number,
  max: number,
) => {
  if (typeof value === "string" && !value.length) {
    return true;
  }
  const floatValue =
    typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isNaN(floatValue) || floatValue > max || floatValue < min;
};

function getNumberPrecision(num: number | string) {
  const numStr = String(num);

  if (numStr.includes("e") || numStr.includes("E")) {
    const [base, exponent] = numStr.split(/[eE]/);
    const decimalPart = base.split(".")[1] || "";
    const precision = decimalPart.length - Number.parseInt(exponent, 10);
    return Math.max(0, precision);
  }

  if (numStr.includes(".")) {
    return numStr.split(".")[1].length;
  }

  return 0;
}

const defaultPattern: NumberInputProps["pattern"] = (inputValue) =>
  /^[+-]?(\d+(\.\d*)?|\.\d*)?$/.test(inputValue);

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(
    {
      "aria-valuetext": ariaValueTextProp,
      bordered,
      className: classNameProp,
      clamp,
      decimalScale: decimalScaleProp,
      disabled,
      emptyReadOnlyMarker = "—",
      endAdornment,
      format: formatProp,
      hideButtons,
      id: idProp,
      pattern = defaultPattern,
      inputProps: inputPropsProp = {},
      inputRef: inputRefProp,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      onBlur,
      onChange,
      onNumberChange: onNumberChangeProp,
      parse: parseProp,
      placeholder,
      readOnly: readOnlyProp,
      startAdornment,
      step = 1,
      stepMultiplier = 2,
      textAlign = "left",
      validationStatus: validationStatusProp,
      value: valueProp,
      variant = "primary",
      defaultValue: defaultValueProp,
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

    const {
      a11yProps: {
        "aria-describedby": formFieldDescribedBy,
        "aria-labelledby": formFieldLabelledBy,
      } = {},
      disabled: formFieldDisabled,
      readOnly: formFieldReadOnly,
      necessity: formFieldRequired,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const isDisabled = disabled || formFieldDisabled;
    const isReadOnly = readOnlyProp || formFieldReadOnly;
    const validationStatus = formFieldValidationStatus ?? validationStatusProp;
    const validationStatusId = useId(idProp);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleInputRef = useForkRef(inputRefProp, inputRef);

    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      className: inputClassName,
      onBlur: inputOnBlur,
      onFocus: inputOnFocus,
      required: inputRequired,
      onKeyDown: inputOnKeyDown,
      ...restInputProps
    } = inputPropsProp;

    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : inputRequired;

    const [isFocused, setIsFocused] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { DecreaseIcon, IncreaseIcon } = useIcon();

    const [value, setValue] = useControlled({
      controlled: valueProp !== undefined ? String(valueProp) : undefined,
      default: String(defaultValueProp ?? ""),
      name: "NumberInput",
      state: "value",
    });

    const decimalScale =
      decimalScaleProp ||
      Math.max(getNumberPrecision(value), getNumberPrecision(step));

    const defaultFormat = (value: string): string => {
      const sanitized = value.trim();
      if (!sanitized.length) {
        return "";
      }
      const floatValue = Number.parseFloat(sanitized);
      const updatedValue = Number.isNaN(floatValue)
        ? sanitized
        : floatValue.toFixed(decimalScale);
      return String(updatedValue);
    };

    const defaultParse = (value: string) => {
      const sanitizedValue = value.trim();
      if (!sanitizedValue.length) {
        return null;
      }
      if (
        sanitizedValue === "." ||
        sanitizedValue === "+" ||
        sanitizedValue === "-"
      ) {
        return 0;
      }
      const floatString = Number.parseFloat(value).toFixed(decimalScale);
      return Number.parseFloat(floatString);
    };

    const format = formatProp ?? defaultFormat;
    const parse = parseProp ?? defaultParse;

    // Committed values are complete numbers, created through blur or increment/decrement, not partial entries such as "0." created by input/onChange.
    const lastCommitValue = useRef<string>(value);
    const commit = (
      event: SyntheticEvent | null,
      newNumber: number | null,
      newInputValue: string,
    ) => {
      let safeNumber = newNumber;
      if (safeNumber !== null && !Number.isNaN(safeNumber)) {
        safeNumber = Math.max(
          Number.MIN_SAFE_INTEGER,
          Math.min(Number.MAX_SAFE_INTEGER, safeNumber),
        );
        if (clamp) {
          safeNumber = Math.max(min, Math.min(max, safeNumber));
        }
      }
      const commitValue =
        safeNumber !== null && !Number.isNaN(safeNumber)
          ? safeNumber.toFixed(decimalScale)
          : newInputValue;

      if (commitValue !== value) {
        setValue(commitValue);
      }

      if (lastCommitValue.current !== commitValue) {
        onChange?.(event, commitValue);
        onNumberChangeProp?.(event, safeNumber);
      }
      lastCommitValue.current = commitValue;
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsEditing(false);
      inputOnBlur?.(event);
      const parsedValue = parse(value);
      commit(event, parsedValue, value);
    };

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsEditing(false);
      inputOnFocus?.(event);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.currentTarget.value;

      if (!inputValue.length) {
        setValue("");
        onChange?.(event, "");
        return;
      }
      const validValue = pattern ? pattern(inputValue) : true;
      console.log("validValue", validValue);
      if (validValue) {
        setIsEditing(true);
        onChange?.(event, event.target.value);
        setValue(inputValue);
      } else {
        event.preventDefault();
      }
    };

    const decrementValue = (event?: SyntheticEvent, block?: boolean) => {
      const decrementStep = (block ? stepMultiplier : 1) * step;
      let adjustedValue = parse(value) ?? 0;
      if (Number.isNaN(adjustedValue)) {
        return;
      }
      adjustedValue -= decrementStep;
      commit(event ?? null, adjustedValue, String(adjustedValue));
    };

    let floatValue = parse(value) ?? 0;
    floatValue = Math.max(
      Number.MIN_SAFE_INTEGER,
      Math.min(Number.MAX_SAFE_INTEGER, floatValue),
    );
    if (clamp) {
      floatValue = Math.max(min, Math.min(max, floatValue));
    }

    const { activate: activateDecrement } = useActivateWhileMouseDown(
      decrementValue,
      floatValue <= min,
    );

    const incrementValue = (event?: SyntheticEvent, block?: boolean) => {
      const incrementStep = (block ? stepMultiplier : 1) * step;
      let adjustedValue = parse(value) ?? 0;
      if (Number.isNaN(adjustedValue)) {
        return;
      }
      adjustedValue += incrementStep;
      commit(event ?? null, adjustedValue, String(adjustedValue));
    };

    useEffect(() => {
      if (isFocused) {
        inputRef.current?.focus();
      }
    }, [isFocused]);

    const { activate: activateIncrement } = useActivateWhileMouseDown(
      incrementValue,
      floatValue >= max,
    );

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowUp": {
          event.preventDefault();
          const block = event.shiftKey;
          incrementValue(event, block);
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          const block = event.shiftKey;
          decrementValue(event, block);
          break;
        }
        case "Home": {
          event.preventDefault();
          const newValue = String(min);
          setValue(newValue);
          commit(event, min, newValue);
          break;
        }
        case "End": {
          event.preventDefault();
          const newValue = String(max);
          setValue(newValue);
          commit(event, max, newValue);
          break;
        }
        case "PageUp": {
          event.preventDefault();
          incrementValue(event, true);
          break;
        }
        case "PageDown": {
          event.preventDefault();
          decrementValue(event, true);
          break;
        }
      }
      inputOnKeyDown?.(event);
    };

    const handleIncrementMouseDown = (
      event: SyntheticEvent,
      disableIncrement: boolean,
    ) => {
      event.preventDefault();
      if (!disableIncrement) {
        setIsEditing(false);
        activateIncrement(event);
      } else if (inputRef.current) {
        inputRef.current.select();
      }
    };

    const handleDecrementMouseDown = (
      event: SyntheticEvent,
      disableDecrement: boolean,
    ) => {
      event.preventDefault();
      if (!disableDecrement) {
        setIsEditing(false);
        activateDecrement(event);
      } else if (inputRef.current) {
        inputRef.current.select();
      }
    };

    const handleContainerMouseUp: MouseEventHandler<HTMLDivElement> = (
      event,
    ) => {
      setIsFocused(true);
      restProps.onMouseUp?.(event);
    };

    let renderedValue: string;
    if (isEditing) {
      renderedValue = value;
    } else if (!value?.length) {
      renderedValue = "";
    } else {
      renderedValue = format(
        Number.isNaN(floatValue) ? value : String(floatValue),
      );
    }

    const disableDecrement = disabled || floatValue - step < min;
    const disableIncrement = disabled || floatValue + step > max;
    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("focused")]: isFocused,
            [withBaseName("disabled")]: isDisabled,
            [withBaseName("readOnly")]: isReadOnly,
            [withBaseName("hiddenButtons")]: hideButtons,
            [withBaseName(validationStatus || "")]: validationStatus,
            [withBaseName("bordered")]: bordered,
          },
          classNameProp,
        )}
        onBlur={handleBlur}
        onMouseUp={handleContainerMouseUp}
        {...restProps}
        ref={ref}
      >
        {startAdornment && (
          <div className={withBaseName("startAdornmentContainer")}>
            {startAdornment}
          </div>
        )}
        <input
          aria-describedby={
            clsx(formFieldDescribedBy, inputDescribedBy) || undefined
          }
          aria-labelledby={
            clsx(formFieldLabelledBy, inputLabelledBy) || undefined
          }
          aria-invalid={
            !isReadOnly && renderedValue.length
              ? isOutOfRange(floatValue, min, max) ||
                validationStatus === "error"
              : undefined
          }
          className={clsx(
            withBaseName("input"),
            withBaseName(`inputTextAlign${capitalize(textAlign)}`),
            inputClassName,
          )}
          disabled={isDisabled}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={isReadOnly ? undefined : handleInputKeyDown}
          placeholder={placeholder}
          readOnly={isReadOnly}
          aria-readonly={isReadOnly ? "true" : undefined}
          ref={handleInputRef}
          required={isRequired}
          aria-valuemax={!isReadOnly && renderedValue.length ? max : undefined}
          aria-valuemin={!isReadOnly && renderedValue.length ? min : undefined}
          aria-valuenow={!isReadOnly ? floatValue : undefined}
          aria-valuetext={
            !isReadOnly
              ? renderedValue.length
                ? (ariaValueTextProp ?? renderedValue)
                : "Empty"
              : undefined
          }
          // Workaround to have readonly conveyed by screen readers (https://github.com/jpmorganchase/salt-ds/issues/4586)
          role={isReadOnly ? "textbox" : "spinbutton"}
          tabIndex={isDisabled ? -1 : 0}
          value={
            isReadOnly && renderedValue.length === 0
              ? emptyReadOnlyMarker
              : renderedValue
          }
          {...restInputProps}
        />
        <div className={withBaseName("activationIndicator")} />
        {!isDisabled && validationStatus && (
          <StatusAdornment status={validationStatus} id={validationStatusId} />
        )}
        {endAdornment && (
          <div className={withBaseName("endAdornmentContainer")}>
            {endAdornment}
          </div>
        )}
        {!isReadOnly && (
          <div className={clsx(withBaseName("buttonContainer"))}>
            <Button
              aria-hidden={true}
              appearance="transparent"
              tabIndex={-1}
              disabled={disableIncrement}
              className={withBaseName("increment")}
              onMouseDown={(event) =>
                handleIncrementMouseDown(event, disableIncrement)
              }
            >
              <IncreaseIcon aria-hidden />
            </Button>
            <Button
              aria-hidden={true}
              appearance="transparent"
              tabIndex={-1}
              disabled={disableDecrement}
              className={withBaseName("decrement")}
              onMouseDown={(event) =>
                handleDecrementMouseDown(event, disableDecrement)
              }
            >
              <DecreaseIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
    );
  },
);

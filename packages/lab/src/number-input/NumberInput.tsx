import {
  Button,
  StatusAdornment,
  type ValidationStatus,
  capitalize,
  makePrefixer,
  useControlled,
  useForkRef,
  useFormFieldProps,
  useIcon,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clamp,
  getNumberPrecision,
  isEmpty,
  isOutOfRange,
  sanitizeInput,
  toFloat,
} from "./internal/utils";

import numberInputCss from "./NumberInput.css";
import { useNumberInput } from "./useNumberInput";
import useCaretPosition from "./internal/useCaretPosition";

const withBaseName = makePrefixer("saltNumberInput");

export interface NumberInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Styling variant with full border. Defaults to false
   * */
  bordered?: boolean;
  /**
   * A setting that determines whether clamping out of range values occurs when the
   * input loses focus, while typing, or not at all.
   * @default none
   */
  clampValue?: boolean;
  /**
   * The default value. Use when the component is not controlled.
   */
  defaultValue?: number | string;
  /**
   * Disable the `NumberInput`.
   */
  disabled?: boolean;
  /**
   * End adornment component.
   */
  endAdornment?: ReactNode;
  /**
   * A callback to format the value of the `NumberInput`.
   */
  format?: (value: number | string) => string | number;
  /**
   * Hide the number buttons. Defaults to `false`.
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
   * The maximum value that can be selected. Defaults to Number.MAX_SAFE_INTEGER.
   * @default Number.MAX_SAFE_INTEGER
   */
  max?: number;
  /**
   * The minimum value that can be selected. Defaults to Number.MIN_SAFE_INTEGER.
   * @default Number.MIN_SAFE_INTEGER
   */
  min?: number;
  /**
   * Callback function that is triggered when the value of the `NumberInput` changes.
   *
   * @param event - The event that triggers the value change. This may be `undefined` during a long press on the increment or decrement buttons.
   * @param value - The new value of the `NumberInput`, which can be a number or a string.
   */
  onChange?: (
    event: SyntheticEvent | undefined,
    value: number | string,
  ) => void;
  /**
   *
   * A callback to parse the value of the `NumberInput`. To be used alongside
   * the `format` callback.
   */
  parse?: (value: number | string) => string | number;
  /**
   * A string displayed in a dimmed color when the `NumberInput` value is empty.
   */
  placeholder?: string;
  /**
   * The number of decimal places allowed. Defaults to the decimal scale of either the initial value provided or the step, whichever is greater.
   */
  decimalScale?: number;
  /**
   * A boolean property that controls the editability of the `NumberInput`.
   * - When set to `true`, the `NumberInput` becomes read-only, preventing user edits.
   * - When set to `false` or omitted, the `NumberInput` is editable by the user.
   */
  readOnly?: boolean;
  /**
   * Start adornment component.
   */
  startAdornment?: ReactNode;
  /**
   * The amount to increment or decrement the value by when using the `NumberInput` buttons or Up Arrow and Down Arrow keys. Defaults to 1.
   * @default 1
   */
  step?: number;
  /**
   * Defines the factor by which the step value is multiplied to determine the maximum increment or decrement when the Shift key
   * is held while pressing the Up Arrow or Down Arrow keys for faster adjustments of the value. The default multiplier value is 2.
   * @default 2
   */
  stepMultiplier?: number;
  /**
   * Specifies the alignment of the text within the `NumberInput`.
   * - Options include "left", "center", and "right".
   * - Defaults to "left" if not specified.
   *
   * @default "left"
   */
  textAlign?: "left" | "center" | "right";
  /**
   * Validation status.
   */
  validationStatus?: Extract<ValidationStatus, "error" | "warning" | "success">;
  /**
   * Styling variant. Defaults to "primary".
   * @default "primary"
   */
  variant?: "primary" | "secondary";
  /**
   * Value of the `NumberInput`, to be used when in a controlled state.
   */
  value?: number | string;
}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(
    {
      bordered = false,
      className: classNameProp,
      clampValue = false,
      disabled,
      endAdornment,
      format,
      hideButtons,
      id: idProp,
      inputProps: inputPropsProp = {},
      inputRef: inputRefProp,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      onChange: onChangeProp,
      parse,
      placeholder,
      decimalScale: decimalScaleProp,
      readOnly: readOnlyProp,
      startAdornment,
      step = 1,
      stepMultiplier = 2,
      textAlign = "left",
      validationStatus: validationStatusProp,
      value: valueProp,
      variant = "primary",
      defaultValue: defaultValueProp = "",
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
    const decimalScale =
      decimalScaleProp ||
      Math.max(
        getNumberPrecision(valueProp || defaultValueProp),
        getNumberPrecision(step),
      );

    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleInputRef = useForkRef(inputRefProp, inputRef);

    const { IncreaseIcon, DecreaseIcon } = useIcon();

    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      className: inputClassName,
      onBlur: inputOnBlur,
      onChange: inputOnChange,
      onFocus: inputOnFocus,
      required: inputRequired,
      onKeyDown: inputOnKeyDown,
      ...restInputProps
    } = inputPropsProp;

    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : inputRequired;

    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValueProp,
      name: "NumberInput",
      state: "value",
    });

    const [displayValue, setDisplayValue] = useState<string | number>(
      sanitizeInput(value?.toString() ?? "").toString(),
    );

    const { setCaretPosition, resetCaretPosition } = useCaretPosition({
      inputRef,
      value: displayValue,
    });

    const {
      decrementButtonProps,
      decrementValue,
      incrementButtonProps,
      incrementValue,
    } = useNumberInput({
      inputRef,
      setValue,
      disabled,
      max,
      min,
      onChange: onChangeProp,
      parse,
      decimalScale,
      readOnly: isReadOnly,
      step,
      stepMultiplier,
      setIsEditing,
      value,
    });

    useEffect(() => {
      const updateDisplayValue = () => {
        if (isEditing || isEmpty(value)) {
          return value;
        }
        const floatValue = toFloat(value);
        if (Number.isNaN(floatValue)) {
          return value;
        }
        const clampedValue = clampValue
          ? clamp(max, min, floatValue)
          : floatValue;
        return format
          ? format(clampedValue)
          : clampedValue.toFixed(decimalScale);
      };
      setDisplayValue(updateDisplayValue().toString());
    }, [value, isEditing, format, clampValue, decimalScale, min, max]);

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsEditing(true);
      const parsedValue = parse?.(value) ?? value;
      const floatValue = !isEmpty(parsedValue)
        ? toFloat(parsedValue).toFixed(decimalScale)
        : parsedValue;
      setValue(floatValue);
      inputOnFocus?.(event);
    };

    const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsEditing(false);
      const rawValue = sanitizeInput(event.target.value);
      let updatedValue = rawValue;
      if (!isEmpty(rawValue)) {
        const floatValue = toFloat(rawValue);
        const clampedValue = clampValue
          ? clamp(max, min, floatValue)
          : floatValue;
        updatedValue = Number(clampedValue.toFixed(decimalScale));
      }
      if (String(updatedValue) !== String(value)) {
        onChangeProp?.(event, updatedValue);
        setValue(updatedValue);
      }
      resetCaretPosition();
      inputOnBlur?.(event);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const beforeStart =
        event.target.selectionStart ?? event.target.value.length;
      const beforeEnd = event.target.selectionEnd ?? event.target.value.length;

      setCaretPosition(beforeStart, beforeEnd);

      const raw = sanitizeInput(event.target.value);
      if (String(raw) === String(value)) {
        return;
      }

      if (parse && !isEditing) {
        const parsed = parse(raw);
        setValue(parsed);
        onChangeProp?.(event, parsed);
      } else {
        setValue(raw);
        onChangeProp?.(event, raw);
      }
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      setIsEditing(true);

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
          setValue(min);
          onChangeProp?.(event, min);
          break;
        }
        case "End": {
          event.preventDefault();
          setValue(max);
          onChangeProp?.(event, max);
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

    const handleBeforeInput = () => {
      setIsEditing(true);
    };

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("disabled")]: isDisabled,
            [withBaseName("readOnly")]: isReadOnly,
            [withBaseName("hiddenButtons")]: hideButtons,
            [withBaseName(validationStatus || "")]: validationStatus,
            [withBaseName("bordered")]: bordered,
          },
          classNameProp,
        )}
        {...restProps}
        ref={ref}
      >
        {startAdornment && (
          <div className={withBaseName("startAdornmentContainer")}>
            {startAdornment}
          </div>
        )}
        <input
          aria-describedby={clsx(
            validationStatusId,
            formFieldDescribedBy,
            inputDescribedBy,
          )}
          aria-labelledby={clsx(formFieldLabelledBy, inputLabelledBy)}
          aria-invalid={
            !isReadOnly
              ? isOutOfRange(value, min, max) || validationStatus === "error"
              : undefined
          }
          aria-valuemax={!isReadOnly ? max : undefined}
          aria-valuemin={!isReadOnly ? min : undefined}
          aria-valuenow={
            value && !Number.isNaN(toFloat(value)) && !isReadOnly
              ? toFloat(parse?.(value) || value)
              : undefined
          }
          // Workaround to have the value announced by screen reader on Safari.
          {...(!isReadOnly && { "aria-valuetext": value.toString() })}
          className={clsx(
            withBaseName("input"),
            withBaseName(`inputTextAlign${capitalize(textAlign)}`),
            inputClassName,
          )}
          disabled={isDisabled}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          onBeforeInput={handleBeforeInput}
          placeholder={placeholder}
          readOnly={isReadOnly}
          aria-readonly={isReadOnly ? "true" : undefined}
          ref={handleInputRef}
          required={isRequired}
          // Workaround to have readonly conveyed by screen readers (https://github.com/jpmorganchase/salt-ds/issues/4586)
          role={isReadOnly ? "textbox" : "spinbutton"}
          tabIndex={isDisabled ? -1 : 0}
          value={displayValue}
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
              className={clsx(
                withBaseName("numberButton"),
                withBaseName("numberButtonIncrement"),
              )}
              appearance="transparent"
              {...incrementButtonProps}
            >
              <IncreaseIcon aria-hidden />
            </Button>
            <Button
              className={clsx(
                withBaseName("numberButton"),
                withBaseName("numberButtonDecrement"),
              )}
              appearance="transparent"
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

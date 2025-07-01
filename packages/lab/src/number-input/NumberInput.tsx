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
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  clampToRange,
  getNumberPrecision,
  isEmpty,
  isOutOfRange,
  sanitizeInput,
  toFloat,
} from "./internal/utils";

import numberInputCss from "./NumberInput.css";
import useCaret from "./internal/useCaret";
import { useNumberInput } from "./useNumberInput";

const withBaseName = makePrefixer("saltNumberInput");

export interface NumberInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
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
   * Use `''` to disable this feature.
   * @default "—"
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component.
   */
  endAdornment?: ReactNode;
  /**
   * A callback to format the value of the `NumberInput`.
   */
  format?: (value: number | string) => string | number;
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

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(
    {
      bordered = false,
      className: classNameProp,
      clamp = false,
      disabled,
      emptyReadOnlyMarker = "—",
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
    const isEmptyReadOnly = isReadOnly && !defaultValueProp && !valueProp;
    const defaultValue = isEmptyReadOnly
      ? emptyReadOnlyMarker
      : defaultValueProp;

    const validationStatusId = useId(idProp);
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

    const isAdjustingRef = useRef<boolean>(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const [recordCaret, restoreCaret, resetCaret] = useCaret({
      inputRef,
    });

    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "NumberInput",
      state: "value",
    });

    const decimalScale =
      decimalScaleProp ||
      Math.max(getNumberPrecision(value), getNumberPrecision(step));

    const [displayValue, setDisplayValue] = useState<string | number>(value);

    const clampAndFix = (value: number) => {
      const clampedValue = clamp ? clampToRange(min, max, value) : value;
      return !format ? clampedValue.toFixed(decimalScale) : clampedValue;
    };

    const {
      decrementButtonProps,
      decrementValue,
      incrementButtonProps,
      incrementValue,
    } = useNumberInput({
      clampAndFix,
      decimalScale,
      disabled,
      format,
      inputRef,
      isAdjustingRef,
      max,
      min,
      onChange: onChangeProp,
      parse,
      readOnly: isReadOnly,
      setIsEditing,
      setValue,
      step,
      stepMultiplier,
      value,
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: We do not want to re-render when  display value changes
    useEffect(() => {
      const formatValue = () => {
        const sanitizedValue = sanitizeInput(value);
        const floatValue = toFloat(sanitizedValue);
        if (
          !isAdjustingRef.current &&
          (isEditing ||
            isEmpty(value) ||
            Number.isNaN(floatValue) ||
            isReadOnly)
        ) {
          return value;
        }
        if (isAdjustingRef.current) {
          return clampAndFix(toFloat(value));
        }
        const clampedValue = clampAndFix(floatValue);
        return format ? format(clampedValue) : clampedValue;
      };
      const updatedValue = formatValue();
      setDisplayValue(updatedValue);
    }, [value, isEditing, isReadOnly, format, clamp, decimalScale, min, max]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Need to restore caret position when value changes.
    useLayoutEffect(() => {
      if (isAdjustingRef.current) {
        resetCaret();
      } else {
        restoreCaret();
      }
    }, [displayValue, value]);

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (isReadOnly) return;
      const parsedValue = parse?.(value) ?? value;
      const updatedValue = !isEmpty(parsedValue)
        ? clampAndFix(toFloat(parsedValue))
        : parsedValue;
      setDisplayValue(updatedValue);
      inputOnFocus?.(event);
    };

    const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (isReadOnly) return;
      setIsEditing(false);
      isAdjustingRef.current = false;
      resetCaret();
      const inputValue = event.target.value;
      if (isEmpty(inputValue)) {
        return;
      }
      const sanitizedValue = sanitizeInput(event.target.value);
      const floatValue = toFloat(sanitizedValue);
      const clampedValue = clampAndFix(floatValue);
      // Update the value if it has changed
      if (clampedValue.toString() !== value.toString()) {
        setValue(clampedValue);
        onChangeProp?.(event, clampedValue);
      }
      // Ensure the displayValue is updated with the formatted value
      const formattedValue = format ? format(clampedValue) : clampedValue;
      setDisplayValue(formattedValue);
      inputOnBlur?.(event);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      recordCaret();
      const raw = sanitizeInput(event.target.value);
      if (raw.toString() === value.toString()) {
        return;
      }
      const parsed = parse && !isEditing ? parse(raw) : raw;
      setValue(parsed);
      onChangeProp?.(event, parsed);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      setIsEditing(true);
      isAdjustingRef.current = false;

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
            [withBaseName("focused")]: isFocused,
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

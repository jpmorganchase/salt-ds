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
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clampToRange,
  getNumberPrecision,
  isAllowed,
  isEmpty,
  isOutOfRange,
  sanitizeInput,
  toFloat,
} from "./internal/utils";
import numberInputCss from "./NumberInput.css";
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
  defaultValue?: number;
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
   * Always display fixed number of decimals
   */
  fixedDecimalScale?: boolean;
  /**
   * A callback to format the value of the `NumberInput`.
   */
  format?: (value: number | string) => string;
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
  onChange?: (event: SyntheticEvent | undefined, value: number) => void;
  /**
   * Callback for final value
   */
  onChangeEnd?: (event: SyntheticEvent | undefined, value: number) => void;
  /**
   * Callback for formatted value
   */
  onValueChange?: (value: string) => void;
  /**
   *
   * A callback to parse the value of the `NumberInput`. To be used alongside
   * the `format` callback.
   */
  parse?: (value: number | string) => number;
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
   * Callback to validate input
   */
  isAllowed?: (value: string) => boolean;
  /**
   * Value of the `NumberInput`, to be used when in a controlled state.
   */
  value?: number;
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
      fixedDecimalScale,
      format,
      hideButtons,
      id: idProp,
      inputProps: inputPropsProp = {},
      inputRef: inputRefProp,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      onChange: onChangeProp,
      onChangeEnd,
      onValueChange,
      parse,
      placeholder,
      decimalScale: decimalScaleProp,
      readOnly: readOnlyProp,
      startAdornment,
      step = 1,
      stepMultiplier = 2,
      textAlign = "left",
      validationStatus: validationStatusProp,
      isAllowed: isAllowedProp,
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
    const isValueAllowed = isAllowedProp || isAllowed;
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

    const [value, setValue, isControlled] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "NumberInput",
      state: "value",
    });

    const decimalScale =
      decimalScaleProp ||
      Math.max(getNumberPrecision(value), getNumberPrecision(step));

    const [displayValue, setDisplayValue] = useState<string | number>(value);

    const clampAndFix = (value: number): number | string => {
      const clampedValue = clamp ? clampToRange(min, max, value) : value;
      if (format) {
        return clampedValue;
      }
      return fixedDecimalScale
        ? clampedValue.toFixed(decimalScale)
        : toFloat(clampedValue.toFixed(decimalScale));
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
        if (isEmpty(value)) {
          return "";
        }
        if (!isAdjustingRef.current && (isEditing || isReadOnly)) {
          return displayValue;
        }
        const updatedValue = Number.isNaN(toFloat(value))
          ? sanitizeInput(value)
          : value;
        const clampAndFixed = clampAndFix(toFloat(updatedValue));
        const formatted = format ? format(clampAndFixed) : clampAndFixed;
        return formatted;
      };
      const updatedValue = formatValue();
      setDisplayValue(updatedValue);
    }, [value]);

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      inputOnFocus?.(event);
    };

    const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (isReadOnly) return;
      setIsEditing(false);
      isAdjustingRef.current = false;
      const inputValue = event.target.value;
      if (isEmpty(inputValue)) {
        return;
      }
      const parsed = parse ? parse(inputValue) : sanitizeInput(inputValue);
      const clampAndFixed = !Number.isNaN(toFloat(parsed))
        ? clampAndFix(toFloat(parsed))
        : toFloat(parsed);
      if (value !== clampAndFixed) {
        setValue(clampAndFixed || "");
        onChangeProp?.(event, toFloat(clampAndFixed) || 0);
        inputOnBlur?.(event);
      }
      if (format) {
        const formatted = format(clampAndFixed);
        onValueChange?.(formatted);
        setDisplayValue(formatted);
      }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      if (isControlled && !onChangeProp) {
        return;
      }
      if (isEmpty(inputValue)) {
        setDisplayValue("");
        setValue("");
        onChangeProp?.(event, 0);
      } else if (!isValueAllowed(inputValue)) {
        return;
      } else {
        setDisplayValue(inputValue);
        setValue(inputValue);
        const parsed = parse ? parse(inputValue) : inputValue;
        onChangeProp?.(event, toFloat(parsed));
      }
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
          setDisplayValue(min);
          setValue(min);
          onChangeProp?.(event, min);
          break;
        }
        case "End": {
          event.preventDefault();
          setDisplayValue(max);
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

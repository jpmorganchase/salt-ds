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
  type MouseEvent,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  clampToRange,
  getNumberPrecision,
  isAllowed,
  isOutOfRange,
  sanitizeInput,
  toFloat,
} from "./internal/utils";
import numberInputCss from "./NumberInput.css";
import { useActivateWhileMouseDown } from "./internal/useActivateWhileMouseDown";

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
   * The default value. Use when the component is uncontrolled.
   */
  defaultValue?: number | null;
  /**
   * Disable the `NumberInput`.
   * @default false
   */
  disabled?: boolean;
  /**
   * Number of decimal places.
   * @default undefined
   */
  decimalScale?: number | undefined;
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
   * If true, 0s will be padded to the value to match the given `decimalScale`.
   */
  fixedDecimalScale?: boolean;
  /**
   * A callback to format the value of the `NumberInput`.
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
   * @param value - The entered value of the `NumberInput`.
   */
  onChange?: (event?: SyntheticEvent | undefined, value?: string) => void;
  /**
   * Callback function that is triggered when the value of the `NumberInput` changes.
   *
   * @param event - The event that triggers the value change. This may be `undefined` during a long press on the increment or decrement buttons.
   * @param value - The parsed value of the `NumberInput`
   */
  onNumberChange?: (event?: SyntheticEvent, value?: number) => void;
  /**
   *
   * A callback to parse the value of the `NumberInput`. To be used alongside the `format` callback.
   */
  parse?: (value: string) => number;
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
  value?: number | null;
}

const defaultFormat = (value: string):string => {
  const floatValue = toFloat(value);
  const updatedValue = Number.isNaN(floatValue) ? sanitizeInput(value) : value;
  return String(updatedValue);
};

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(
    {
      "aria-valuetext": ariaValueTextProp,
      bordered,
      className: classNameProp,
      clamp,
      decimalScale,
      disabled,
      emptyReadOnlyMarker = "—",
      endAdornment,
      fixedDecimalScale,
      format = defaultFormat,
      hideButtons,
      id: idProp,
      inputProps: inputPropsProp = {},
      inputRef: inputRefProp,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      onChange,
      onClick,
      onNumberChange,
      parse = (value: string) => toFloat(sanitizeInput(value)),
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
    const validationStatusId = useId();
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

    const [renderRaw, setRenderRaw] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [isStepping, setIsStepping] = useState(false);
    const { DecreaseIcon, IncreaseIcon } = useIcon();

    const [value, setValue] = useControlled({
      controlled: valueProp !== undefined ? String(valueProp) : undefined,
      default: String(defaultValueProp ?? ""),
      name: "NumberInput",
      state: "value",
    });

    // const decimalScale =
    //   decimalScaleProp ??
    //   Math.max(getNumberPrecision(value), getNumberPrecision(step));
    //
    // TODO: Move to docs.
    // const clampAndFix = (value: number): number | string => {
    //   const clampedValue = clamp ? clampToRange(min, max, value) : value;
    //   // TODO: TT/JW Can we remove fixedDecimalScale and just use format, create examples in docs, which show how to do it ?
    //   // if (format) {
    //   //   return clampedValue;
    //   // }
    //   return fixedDecimalScale
    //     ? clampedValue.toFixed(decimalScale)
    //     : toFloat(clampedValue.toFixed(decimalScale));
    // };

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setRenderRaw(true);
      inputOnFocus?.(event);
    };

    const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setIsStepping(false);
      setRenderRaw(false);
    };

    const handleClick = (event: MouseEvent<HTMLInputElement>) => {
      setRenderRaw(true);
      onClick?.(event);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      if (!parse && !isAllowed(inputValue)) {
        return;
      }
      setRenderRaw(true);
      if (!inputValue?.length) {
        setValue("");
        onNumberChange?.(event, 0);
      } else {
        const parsedValue = parse(inputValue);
        onNumberChange?.(event, parsedValue);
        setValue(inputValue);
      }
      onChange?.(event);
    };

    const decrementValue = (event?: SyntheticEvent, block?: boolean) => {
      const decrementStep = block ? stepMultiplier * step : step;
      let decrementedValue = parseFloat(value) - decrementStep;
      const nextValue = decimalScale ? parseFloat(decrementedValue.toFixed(decimalScale)) : decrementedValue;
      setRenderRaw(false);
      if (nextValue < min) return;
      setValue(String(nextValue));
      onChange?.(event, String(nextValue));
      onNumberChange?.(event, nextValue);
    };

    const { activate: activateDecrement } = useActivateWhileMouseDown(
      decrementValue,
      toFloat(value) <= min,
    );

    // TODO: Investigate these optional values
    const incrementValue = (event?: SyntheticEvent, block?: boolean) => {
      const incrementStep = block ? stepMultiplier * step : step;
      let incrementedValue = parseFloat(value) + incrementStep;
      const nextValue = decimalScale ? parseFloat(incrementedValue.toFixed(decimalScale)) : incrementedValue;
      setRenderRaw(false);
      if (nextValue > max) return;
      setValue(String(nextValue));
      onChange?.(event, String(nextValue));
      onNumberChange?.(event, nextValue);
    };

    const { activate: activateIncrement } = useActivateWhileMouseDown(
      incrementValue,
      toFloat(value) >= max,
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
          setValue(String(min));
          setRenderRaw(false);
          onChange?.(event, String(min));
          onNumberChange?.(event, min);
          break;
        }
        case "End": {
          event.preventDefault();
          setValue(String(max));
          setRenderRaw(false);
          onChange?.(event, String(max));
          onNumberChange?.(event, max);
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

    const handleIncrementMouseDown = (event: SyntheticEvent) => {
      event.preventDefault();
      setIsStepping(true);
      activateIncrement(event);
    };

    const handleDecrementMouseDown = (event: SyntheticEvent) => {
      event.preventDefault();
      setRenderRaw(false);
      setIsStepping(true);
      activateDecrement(event);
    };

    const handleButtonMouseUp = () => {
      inputRef?.current?.focus();
      setRenderRaw(false);
      setIsStepping(false);
    };


    let formattedValue: string  = "";
    if (renderRaw) {
      formattedValue = value;
    } else {
      formattedValue = format(value);
    }

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
          aria-describedby={clsx(formFieldDescribedBy, inputDescribedBy)}
          aria-labelledby={clsx(
            formFieldLabelledBy,
            inputLabelledBy,
            validationStatusId,
          )}
          aria-invalid={
            !isReadOnly && formattedValue?.length
              ? isOutOfRange(value, min, max) || validationStatus === "error"
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
          onClick={handleClick}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          readOnly={isReadOnly}
          aria-readonly={isReadOnly ? "true" : undefined}
          ref={handleInputRef}
          required={isRequired}
          {...(!isReadOnly &&
            // Workaround to not have the screen reader announce "50%" when the input is blank.
            formattedValue?.length && {
              "aria-valuemax": max,
              "aria-valuemin": min,
            })}
          {...(!isReadOnly && {
            "aria-valuenow": toFloat(value) ?? 0,
            "aria-valuetext": formattedValue?.length
              ? (ariaValueTextProp ?? formattedValue)
              : "Empty",
          })}
          // Workaround to have readonly conveyed by screen readers (https://github.com/jpmorganchase/salt-ds/issues/4586)
          role={isReadOnly ? "textbox" : "spinbutton"}
          tabIndex={isDisabled ? -1 : 0}
          value={
            isReadOnly && formattedValue === undefined
              ? emptyReadOnlyMarker
              : formattedValue
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
              aria-label={"increment value"}
              appearance="transparent"
              tabIndex={-1}
              className={withBaseName("increment")}
              onMouseDown={handleIncrementMouseDown}
              onMouseUp={handleButtonMouseUp}
              disabled={disabled || toFloat(value) + step > max}
            >
              <IncreaseIcon aria-hidden />
            </Button>
            <Button
              aria-hidden={true}
              aria-label={"decrement value"}
              appearance="transparent"
              tabIndex={-1}
              className={withBaseName("decrement")}
              onMouseDown={handleDecrementMouseDown}
              onMouseUp={handleButtonMouseUp}
              disabled={disabled || toFloat(value) - step < min}
            >
              <DecreaseIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
    );
  },
);

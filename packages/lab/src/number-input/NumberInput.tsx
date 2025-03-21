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
  useRef,
  useState,
} from "react";
import {
  isAllowedNonNumeric,
  isOutOfRange,
  sanitizedInput,
  toFixedDecimalPlaces,
  toFloat,
} from "./internal/utils";

import numberInputCss from "./NumberInput.css";
import { useNumberInput } from "./useNumberInput";

const withBaseName = makePrefixer("saltNumberInput");

export interface NumberInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * A boolean. When `true`, the input will receive a full border.
   */
  bordered?: boolean;
  /**
   * The number of decimal places to display.
   */
  decimalPlaces?: number;
  /**
   * Sets the initial default value of the component.
   */
  defaultValue?: number | string;
  /**
   * If `true`, the number input will be disabled.
   */
  disabled?: boolean;
  /**
   * The marker to use in an empty read only Input.
   * Use `''` to disable this feature. Defaults to '—'.
   * @default '—'
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component.
   */
  endAdornment?: ReactNode;
  /**
   * Whether to hide the number buttons. Defaults to `false`.
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
   * Callback when number input value is changed.
   * @param event - the event triggers value change, could be undefined during increment / decrement button long press
   */
  onChange?: (
    event: SyntheticEvent | undefined,
    value: number | string,
  ) => void;
  /**
   * A string. Displayed in a dimmed color when the input value is empty.
   */
  placeholder?: string | undefined;
  /**
   * A boolean. If `true`, the component is not editable by the user.
   */
  readOnly?: boolean;
  /**
   * Start adornment component.
   */
  startAdornment?: ReactNode;
  /**
   * The amount to increment or decrement the value by when using the number input buttons or Up Arrow and Down Arrow keys. Defaults to 1.
   * @default 1
   */
  step?: number;
  /**
   * The amount to change the value when the value is incremented or decremented by holding Shift and pressing Up arrow or Down arrow keys.
   * Defaults to 10.
   * @default 10
   */
  stepBlock?: number;
  /**
   * Alignment of text within container. Defaults to "left".
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
   * The value of the number input. The component will be controlled if this prop is provided.
   */
  value?: number | string | undefined;
}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(
    {
      bordered,
      className: classNameProp,
      decimalPlaces = 0,
      defaultValue: defaultValueProp,
      disabled,
      emptyReadOnlyMarker = "—",
      endAdornment,
      hideButtons,
      id: idProp,
      inputProps: inputPropsProp = {},
      inputRef: inputRefProp,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      onChange: onChangeProp,
      placeholder,
      readOnly: readOnlyProp,
      startAdornment,
      step = 1,
      stepBlock = 10,
      textAlign = "left",
      validationStatus: validationStatusProp,
      value: valueProp,
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

    const [valueState, setValue] = useControlled({
      controlled: valueProp,
      default:
        typeof defaultValueProp === "number"
          ? toFixedDecimalPlaces(defaultValueProp, decimalPlaces)
          : defaultValueProp,
      name: "NumberInput",
      state: "value",
    });

    // Won't be needed when `:has` css can be used
    const [focused, setFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const forkedInputRef = useForkRef(inputRef, inputRefProp);
    // If value is undefined, start increments/decrements from 0 if min is less than 0 otherwise from min
    const value = valueState === undefined ? (min < 0 ? 0 : min) : valueState;

    const {
      decrementButtonProps,
      decrementValue,
      incrementButtonProps,
      incrementValue,
    } = useNumberInput({
      inputRef,
      setValue,
      setFocused,
      decimalPlaces,
      disabled,
      max,
      min,
      onChange: onChangeProp,
      readOnly: isReadOnly,
      step,
      stepBlock,
      value,
    });

    const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true);

      inputOnFocus?.(event);
    };

    const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
      setFocused(false);

      if (value === undefined) return;

      const floatValue = toFloat(value);
      if (Number.isNaN(floatValue)) {
        // Keep original value if NaN
        setValue(value);
        onChangeProp?.(event, value);
      } else {
        const roundedValue = toFixedDecimalPlaces(floatValue, decimalPlaces);

        if (value !== "" && !isAllowedNonNumeric(value)) {
          setValue(roundedValue);
        }

        onChangeProp?.(event, roundedValue);
      }

      inputOnBlur?.(event);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const changedValue = event.target.value;

      setValue(sanitizedInput(changedValue));

      onChangeProp?.(event, sanitizedInput(changedValue));
      inputOnChange?.(event);
    };

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

    return (
      <div
        className={clsx(withBaseName(), classNameProp)}
        {...restProps}
        ref={ref}
      >
        <div
          className={clsx(
            withBaseName("inputContainer"),
            withBaseName(variant),
            {
              [withBaseName("focused")]: !isDisabled && focused,
              [withBaseName("disabled")]: isDisabled,
              [withBaseName("readOnly")]: isReadOnly,
              [withBaseName(validationStatus || "")]: validationStatus,
              [withBaseName("bordered")]: bordered,
            },
          )}
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
            aria-valuemax={
              !isReadOnly
                ? toFloat(toFixedDecimalPlaces(max, decimalPlaces))
                : undefined
            }
            aria-valuemin={
              !isReadOnly
                ? toFloat(toFixedDecimalPlaces(min, decimalPlaces))
                : undefined
            }
            aria-valuenow={
              value && !Number.isNaN(toFloat(value)) && !isReadOnly
                ? toFloat(toFixedDecimalPlaces(toFloat(value), decimalPlaces))
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
            onFocus={!isDisabled ? handleInputFocus : undefined}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            readOnly={isReadOnly}
            aria-readonly={isReadOnly ? "true" : undefined}
            ref={forkedInputRef}
            required={isRequired}
            // Workaround to have readonly conveyed by screen readers (https://github.com/jpmorganchase/salt-ds/issues/4586)
            role={isReadOnly ? "textbox" : "spinbutton"}
            tabIndex={isDisabled ? -1 : 0}
            value={value}
            {...restInputProps}
          />
          {!isDisabled && validationStatus && (
            <StatusAdornment
              status={validationStatus}
              id={validationStatusId}
            />
          )}
          {endAdornment && (
            <div className={withBaseName("endAdornmentContainer")}>
              {endAdornment}
            </div>
          )}
          <div className={withBaseName("activationIndicator")} />
        </div>

        {!hideButtons && !isReadOnly && (
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

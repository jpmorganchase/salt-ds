import {
  Button,
  Input,
  type InputProps,
  type ValidationStatus,
  capitalize,
  makePrefixer,
  useControlled,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import { TriangleDownIcon, TriangleUpIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  forwardRef,
  useRef,
} from "react";
import {
  ACCEPT_INPUT,
  isAllowedNonNumeric,
  sanitizedInput,
  toFixedDecimalPlaces,
  toFloat,
} from "./internal/utils";

import stepperInputCss from "./StepperInput.css";

const withBaseName = makePrefixer("saltStepperInput");

export interface StepperInputProps
  extends Omit<
    ComponentPropsWithoutRef<"div">,
    "onChange" | "emptyReadOnlyMarker"
  > {
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
   * If `true`, the stepper input will be disabled.
   */
  disabled?: boolean;
  /**
   * The marker to use in an empty read only Input.
   * Use `''` to disable this feature. Defaults to '—'.
   * @default '—'
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
  /**
   * Whether to hide the stepper buttons. Defaults to `false`.
   * @default false
   */
  hideButtons?: boolean;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Optional ref for the input component
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
   * Callback when stepper input value is changed.
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
   * Start adornment component
   */
  startAdornment?: ReactNode;
  /**
   * The amount to increment or decrement the value by when using the stepper buttons or Up Arrow and Down Arrow keys. Default to 1.
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
   * The value of the stepper input. The component will be controlled if this prop is provided.
   */
  value?: number | string | undefined;
}

export const StepperInput = forwardRef<HTMLDivElement, StepperInputProps>(
  function StepperInput(
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
      inputProps = {},
      inputRef,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      onChange,
      placeholder,
      readOnly,
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
      testId: "salt-stepper-input",
      css: stepperInputCss,
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

    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      onBlur,
      onChange: inputOnChange,
      onFocus,
      required: inputPropsRequired,
      ...restInputProps
    } = inputProps;

    const inputId = useId(idProp);

    const [value, setValue, isControlled] = useControlled({
      controlled: valueProp,
      default:
        typeof defaultValueProp === "number"
          ? toFixedDecimalPlaces(defaultValueProp, decimalPlaces)
          : undefined,
      name: "StepperInput",
      state: "value",
    });

    const setNextValue = (
      event: SyntheticEvent | undefined,
      modifiedValue: number,
    ) => {
      if (readOnly) return;
      let nextValue = modifiedValue;
      if (nextValue < min) nextValue = min;
      if (nextValue > max) nextValue = max;

      const roundedValue = toFixedDecimalPlaces(nextValue, decimalPlaces);
      if (Number.isNaN(toFloat(roundedValue))) return;

      setValue(roundedValue);

      onChange?.(event, roundedValue);
    };

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          withBaseName(`textAlign${capitalize(textAlign)}`),
          classNameProp,
        )}
        {...restProps}
        ref={ref}
      >
        {!hideButtons && !readOnly && (
          <div className={withBaseName("buttonContainer")}>
            <Button
              aria-label="increment value"
              className={withBaseName("stepperButtonIncrement")}
              {...getButtonProps("increment")}
            >
              <TriangleUpIcon aria-hidden />
            </Button>
            <Button
              aria-label="decrement value"
              className={withBaseName("stepperButtonDecrement")}
              {...getButtonProps("decrement")}
            >
              <TriangleDownIcon aria-hidden />
            </Button>
          </div>
        )}
      </div>
    );
  },
);

import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { makePrefixer, useControlled } from "../utils";
import { useRadioGroup } from "./internal/useRadioGroup";
import { RadioButtonIcon } from "./RadioButtonIcon";

import radioButtonCss from "./RadioButton.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useFormFieldProps } from "../form-field-context";

const withBaseName = makePrefixer("saltRadioButton");

type RadioButtonValidationStatus = "warning" | "error" | undefined;

export interface RadioButtonProps
  extends Omit<
    HTMLAttributes<HTMLLabelElement>,
    "onChange" | "onBlur" | "onFocus"
  > {
  /**
   * Set the default selected radio button in the group
   */
  checked?: boolean;
  /**
   * Set the disabled state
   */
  disabled?: boolean;
  /**
   * **Deprecated**: Use validationStatus instead
   * Set the error state
   */
  error?: boolean;
  /**
   * Props to be passed to the radio input
   */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  /**
   * The label to be shown next to the radio icon
   */
  label?: ReactNode;
  /**
   * Name of the radio group
   */
  name?: string;
  /**
   * Callback for blur event
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback for change event
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * Callback for focus event
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * Value of radio button
   */
  value?: string;
  /**
   * Validation status.
   */
  validationStatus?: RadioButtonValidationStatus;
}

function getValidationStatus(
  radioGroupStatus: RadioButtonValidationStatus,
  formFieldStatus: RadioButtonValidationStatus | "success" | undefined,
  radioStatus: RadioButtonValidationStatus
) {
  return radioGroupStatus ?? formFieldStatus
    ? formFieldStatus !== "success"
      ? formFieldStatus
      : undefined
    : radioStatus;
}

export const RadioButton = forwardRef<HTMLLabelElement, RadioButtonProps>(
  function RadioButton(props, ref) {
    const {
      checked: checkedProp,
      className,
      disabled: disabledProp,
      error,
      inputProps = {},
      label,
      name: nameProp,
      onFocus,
      onBlur,
      onChange,
      value,
      validationStatus: validationStatusProp,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-radio-button",
      css: radioButtonCss,
      window: targetWindow,
    });

    const {
      a11yProps: formFieldA11yProps,
      disabled: formFieldDisabled,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const radioGroup = useRadioGroup();

    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      ...restInputProps
    } = inputProps;

    const disabled = radioGroup.disabled ?? formFieldDisabled ?? disabledProp;
    const validationStatus = !disabled
      ? getValidationStatus(
          radioGroup.validationStatus,
          formFieldValidationStatus,
          validationStatusProp
        )
      : undefined;

    const radioGroupChecked =
      radioGroup.value != null && value != null
        ? radioGroup.value === value
        : checkedProp;
    const name = nameProp ?? radioGroup.name;

    const [checked, setCheckedState] = useControlled({
      controlled: radioGroupChecked,
      default: Boolean(checkedProp),
      name: "RadioBase",
      state: "checked",
    });

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newChecked = event.target.checked;
      setCheckedState(newChecked);

      onChange?.(event);
      radioGroup.onChange?.(event);
    };

    return (
      <label
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("error")]: error /* **Deprecated** */,
            [withBaseName(validationStatus || "")]: validationStatus,
            [withBaseName("error")]: error,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        <input
          aria-describedby={clsx(
            radioGroup.a11yProps?.["aria-describedby"] ?? formFieldA11yProps?.["aria-describedby"],
            inputDescribedBy
          )}
          aria-labelledby={clsx(
            radioGroup.a11yProps?.["aria-labelledby"] ?? formFieldA11yProps?.["aria-labelledby"],
            inputLabelledBy
          )}
          className={withBaseName("input")}
          {...restInputProps}
          checked={checked}
          disabled={disabled}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={handleChange}
          onFocus={onFocus}
          type="radio"
        />
        <RadioButtonIcon
          checked={checked}
          disabled={disabled}
          validationStatus={validationStatus}
          error={error}
        />
        {label}
      </label>
    );
  }
);

import { clsx } from "clsx";
import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  FocusEventHandler,
  forwardRef,
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
import { AdornmentValidationStatus } from "../status-adornment";

const withBaseName = makePrefixer("saltRadioButton");

export interface RadioButtonProps
  extends Omit<
    ComponentPropsWithoutRef<"label">,
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
   * Set the read only state.
   */
  readOnly?: boolean;
  /**
   * Value of radio button
   */
  value?: string;
  /**
   * Validation status, one of "warning" | "error" | "success"
   *
   * RadioButton has styling variants for "error" and "warning".
   * No visual styling will be applied on "success" variant.
   */
  validationStatus?: AdornmentValidationStatus;
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
      readOnly: readOnlyProp,
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
      readOnly: formFieldReadOnly,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const radioGroup = useRadioGroup();

    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      className: inputClassName,
      onChange: inputOnChange,
      ...restInputProps
    } = inputProps;

    const disabled = radioGroup.disabled || formFieldDisabled || disabledProp;
    const readOnly = radioGroup.readOnly || formFieldReadOnly || readOnlyProp;
    const validationStatus = !disabled
      ? radioGroup.validationStatus ??
        formFieldValidationStatus ??
        validationStatusProp
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
      if (readOnly) return;

      const newChecked = event.target.checked;
      setCheckedState(newChecked);

      onChange?.(event);
      inputOnChange?.(event);
      radioGroup.onChange?.(event);
    };

    return (
      <label
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("readOnly")]: readOnly,
            [withBaseName("error")]: error /* **Deprecated** */,
            [withBaseName(validationStatus || "")]: validationStatus,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        <input
          aria-describedby={clsx(
            radioGroup.a11yProps?.["aria-describedby"] ??
              formFieldA11yProps?.["aria-describedby"],
            inputDescribedBy
          )}
          aria-labelledby={clsx(
            radioGroup.a11yProps?.["aria-labelledby"] ??
              formFieldA11yProps?.["aria-labelledby"],
            inputLabelledBy
          )}
          className={clsx(withBaseName("input"), inputClassName)}
          checked={checked}
          disabled={disabled}
          readOnly={readOnly}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={handleChange}
          onFocus={onFocus}
          type="radio"
          {...restInputProps}
        />
        <RadioButtonIcon
          checked={checked}
          disabled={disabled}
          readOnly={readOnly}
          validationStatus={validationStatus}
          error={error}
        />
        {label}
      </label>
    );
  }
);

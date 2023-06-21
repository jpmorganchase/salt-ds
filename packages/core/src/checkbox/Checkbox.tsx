import { clsx } from "clsx";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { makePrefixer, useControlled } from "../utils";
import { CheckboxIcon } from "./CheckboxIcon";

import checkboxCss from "./Checkbox.css";
import { useCheckboxGroup } from "./internal/useCheckboxGroup";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldProps } from "../form-field-context";

const withBaseName = makePrefixer("saltCheckbox");

type CheckboxValidationStatus = "warning" | "error" | undefined;
export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLLabelElement>,
    "onChange" | "onBlur" | "onFocus"
  > {
  /**
   * If `true`, the checkbox will be checked.
   */
  checked?: boolean;
  /**
   * Whether the checkbox component is checked by default
   * This will be disregarded if checked is already set.
   */
  defaultChecked?: boolean;
  /**
   * If `true`, the checkbox will be disabled.
   */
  disabled?: boolean;
  /**
   * **Deprecated**: Use validationStatus instead
   * If `true`, the checkbox will be in the error state.
   */
  error?: boolean;
  /**
   * If true, the checkbox appears indeterminate. This does not set the native
   * input element to indeterminate due to the inconsistent behaviour across browsers
   * However, a data-indeterminate attribute is set on the input.
   */
  indeterminate?: boolean;
  /**
   * Properties applied to the input element.
   */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>>;
  /**
   * The label to be shown next to the checkbox.
   */
  label?: ReactNode;
  /**
   * The name applied to the input.
   */
  name?: string;
  /**
   * Callback when checkbox loses focus.
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback when checked state is changed.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * Callback when checkbox gains focus.
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * The value of the checkbox.
   */
  value?: string;
  /**
   * Validation status.
   */
  validationStatus?: CheckboxValidationStatus;
}

function getValidationStatus(
  checkboxGroupStatus: CheckboxValidationStatus,
  formFieldStatus: CheckboxValidationStatus | "success" | undefined,
  checkboxStatus: CheckboxValidationStatus
) {
  return checkboxGroupStatus ?? formFieldStatus
    ? formFieldStatus !== "success"
      ? formFieldStatus
      : undefined
    : checkboxStatus;
}

export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  function Checkbox(
    {
      checked: checkedProp,
      className,
      defaultChecked,
      disabled: disabledProp,
      error,
      indeterminate,
      inputProps = {},
      label,
      name,
      onBlur,
      onChange,
      onFocus,
      value,
      validationStatus: validationStatusProp,
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-checkbox",
      css: checkboxCss,
      window: targetWindow,
    });
    const checkboxGroup = useCheckboxGroup();

    const {
      "aria-describedby": inputDescribedBy,
      "aria-labelledby": inputLabelledBy,
      ...restInputProps
    } = inputProps;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      // Workaround for https://github.com/facebook/react/issues/9023
      if (event.nativeEvent.defaultPrevented) {
        return;
      }

      const value = event.target.checked;
      setChecked(value);
      onChange?.(event);
      checkboxGroup.onChange?.(event);
    };

    const checkboxGroupChecked =
      checkedProp == null && value != null
        ? checkboxGroup.checkedValues?.includes(value)
        : checkedProp;

    const [checked, setChecked] = useControlled({
      controlled: checkboxGroupChecked,
      default: Boolean(defaultChecked),
      name: "Checkbox",
      state: "checked",
    });

    const {
      disabled: formFieldDisabled,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const disabled =
      checkboxGroup.disabled ?? formFieldDisabled ?? disabledProp;
    const validationStatus = !disabled
      ? getValidationStatus(
          checkboxGroup.validationStatus,
          formFieldValidationStatus,
          validationStatusProp
        )
      : undefined;

    return (
      <label
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("error")]: error /* **Deprecated** */,
            [withBaseName(validationStatus || "")]: validationStatus,
          },
          className
        )}
        ref={ref}
        {...rest}
      >
        <input
          // aria-checked only needed when indeterminate since native indeterminate behaviour is not used
          aria-checked={indeterminate ? "mixed" : undefined}
          aria-describedby={clsx(
            checkboxGroup.a11yProps?.["aria-describedby"],
            inputDescribedBy
          )}
          aria-labelledby={clsx(
            checkboxGroup.a11yProps?.["aria-labelledby"],
            inputLabelledBy
          )}
          name={name}
          value={value}
          {...restInputProps}
          checked={checked}
          className={withBaseName("input")}
          data-indeterminate={indeterminate}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onBlur={onBlur}
          onChange={handleChange}
          onFocus={onFocus}
          type="checkbox"
        />
        <CheckboxIcon
          checked={checked}
          disabled={disabled}
          indeterminate={indeterminate}
          validationStatus={validationStatus}
          error={error}
        />
        {label}
      </label>
    );
  }
);

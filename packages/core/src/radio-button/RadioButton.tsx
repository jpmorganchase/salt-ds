import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import type { AdornmentValidationStatus } from "../status-adornment";
import type { DataAttributes } from "../types";
import { makePrefixer, useControlled } from "../utils";
import { useRadioGroup } from "./internal/useRadioGroup";
import radioButtonCss from "./RadioButton.css";
import { RadioButtonIcon } from "./RadioButtonIcon";

const withBaseName = makePrefixer("saltRadioButton");

export interface RadioButtonProps
  extends Omit<
    ComponentPropsWithoutRef<"label">,
    "onChange" | "onBlur" | "onFocus"
  > {
  /**
   * If `true`, the radio button is checked. Inside a `RadioButtonGroup`, when `checked` isn't set, the group's `value` decides whether it's checked.
   */
  checked?: boolean;
  /**
   * If `true`, the radio button is disabled. It's also disabled when the surrounding `RadioButtonGroup` or `FormField` is disabled.
   */
  disabled?: boolean;
  /**
   * Set the error state.
   * @deprecated since 1.8.0-rc.2. Use `validationStatus="error"` instead.
   */
  error?: boolean;
  /**
   * Props applied to the `input` element.
   */
  inputProps?: Partial<InputHTMLAttributes<HTMLInputElement>> & DataAttributes;
  /**
   * Used to access the hidden `<input>` element.
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * The label to be shown next to the radio icon.
   */
  label?: ReactNode;
  /**
   * Name of the radio group.
   */
  name?: string;
  /**
   * Callback fired when the radio button loses focus.
   */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /**
   * Callback fired when the checked state changes. It isn't fired when the radio button is read-only.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /**
   * Callback fired when the radio button receives focus.
   */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * If `true`, the radio button is read-only. It's also read-only when the surrounding `RadioButtonGroup` or `FormField` is read-only.
   * **Note**: Setting a standalone radio button as read-only isn't accessible. Set the whole radio button group as read-only instead.
   */
  readOnly?: boolean;
  /**
   * Value of radio button.
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
      inputRef,
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

    const disabled = radioGroup?.disabled || formFieldDisabled || disabledProp;
    const readOnly = radioGroup?.readOnly || formFieldReadOnly || readOnlyProp;
    const validationStatus = !disabled
      ? (radioGroup?.validationStatus ??
        formFieldValidationStatus ??
        validationStatusProp)
      : undefined;

    const radioGroupChecked =
      checkedProp ??
      (radioGroup && value ? radioGroup.value === value : checkedProp);
    const name = nameProp ?? radioGroup?.name;

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
      radioGroup?.onChange?.(event);
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
          className,
        )}
        ref={ref}
        {...rest}
      >
        <input
          aria-describedby={
            clsx(
              radioGroup === undefined
                ? formFieldA11yProps?.["aria-describedby"]
                : undefined,
              inputDescribedBy,
            ) || undefined
          }
          aria-labelledby={
            clsx(
              radioGroup === undefined
                ? formFieldA11yProps?.["aria-labelledby"]
                : undefined,
              inputLabelledBy,
            ) || undefined
          }
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
          ref={inputRef}
          {...restInputProps}
        />
        <RadioButtonIcon
          checked={checked}
          readOnly={readOnly}
          validationStatus={validationStatus}
          error={error}
        />
        {label}
      </label>
    );
  },
);

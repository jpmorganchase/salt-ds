import { clsx } from "clsx";
import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useState,
} from "react";
import { makePrefixer, useControlled, useFormFieldProps } from "@salt-ds/core";
import { StatusAdornment } from "../status-adornment";

import "./InputNext.css";

const withBaseName = makePrefixer("saltInputNext");

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /**
   * The value of the `input` element, required for an uncontrolled component.
   */
  defaultValue?: HTMLInputElement["defaultValue"];
  /**
   * If `true`, the component is disabled.
   */
  disabled?: HTMLInputElement["disabled"];
  /**
   * The marker to use in an empty read only Input.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * Start adornment component
   */
  startAdornment?: ReactNode;
  /**
   * Alignment of text within container. Defaults to "left"
   */
  textAlign?: "left" | "center" | "right";
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * The value of the `input` element, required for a controlled component.
   */
  value?: HTMLInputElement["value"];
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    "aria-activedescendant": ariaActiveDescendant,
    "aria-expanded": ariaExpanded,
    "aria-owns": ariaOwns,
    className: classNameProp,
    disabled,
    emptyReadOnlyMarker = "—",
    endAdornment,
    id,
    inputProps = {},
    readOnly: readOnlyProp,
    role,
    startAdornment,
    style,
    textAlign = "left",
    value: valueProp,
    defaultValue: defaultValueProp = valueProp === undefined ? "" : undefined,
    validationStatus: validationStatusProp,
    variant = "primary",
    ...other
  },
  ref
) {
  const {
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
    validationStatus: formFieldValidationStatus,
    a11yProps,
  } = useFormFieldProps();

  const isDisabled = disabled || formFieldDisabled;
  const isReadOnly = readOnlyProp || formFieldReadOnly;

  const validationStatus = formFieldValidationStatus ?? validationStatusProp;

  const [focused, setFocused] = useState(false);

  const isEmptyReadOnly = isReadOnly && !defaultValueProp && !valueProp;
  const defaultValue = isEmptyReadOnly ? emptyReadOnlyMarker : defaultValueProp;

  const { onBlur, onChange, onFocus, ...restInputProps } = inputProps;

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "Input",
    state: "value",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    onChange?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    setFocused(false);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event);
    setFocused(true);
  };

  const inputStyle = {
    "--inputNext-textAlign": textAlign,
    ...style,
  };

  return (
    <div
      className={clsx(
        withBaseName(),
        {
          [withBaseName("focused")]: !isDisabled && focused,
          [withBaseName("disabled")]: isDisabled,
          [withBaseName("readOnly")]: isReadOnly,
          [withBaseName(validationStatus || "")]: validationStatus,
          [withBaseName(variant)]: variant,
        },
        classNameProp
      )}
      ref={ref}
      style={inputStyle}
      {...other}
    >
      <input
        aria-label={clsx(a11yProps?.["aria-labelledby"], inputProps["aria-labelledby"])}
        id={id}
        className={clsx(withBaseName("input"), inputProps?.className)}
        disabled={isDisabled}
        readOnly={isReadOnly}
        value={value}
        tabIndex={isReadOnly || isDisabled ? -1 : 0}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={!isDisabled ? handleFocus : undefined}
        {...a11yProps}
        {...restInputProps}
      />
      {!isDisabled && !isReadOnly && validationStatus && (
        <StatusAdornment status={validationStatus} />
      )}
      <div className={withBaseName("activationIndicator")} />
    </div>
  );
});

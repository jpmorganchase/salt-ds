import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldProps } from "../form-field-context";
import { makePrefixer, useControlled } from "../utils";
import { StatusAdornment } from "../status-adornment";

import inputCss from "./Input.css";

const withBaseName = makePrefixer("saltInput");

export interface InputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue"
    > {
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
   * Optional ref for the input component
   */
  inputRef?: Ref<HTMLInputElement>;
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
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const Input = forwardRef<HTMLDivElement, InputProps>(function Input(
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
    inputRef,
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
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-input",
    css: inputCss,
    window: targetWindow,
  });

  const {
    a11yProps: {
      "aria-labelledby": formFieldLabelledBy,
      ...restFormFieldA11yProps
    } = {},
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
    validationStatus: formFieldValidationStatus,
  } = useFormFieldProps();

  const restA11yProps = {
    ariaActiveDescendant,
    ariaExpanded,
    ariaOwns,
    ...restFormFieldA11yProps,
  };

  const isDisabled = disabled || formFieldDisabled;
  const isReadOnly = readOnlyProp || formFieldReadOnly;

  const validationStatus = formFieldValidationStatus ?? validationStatusProp;

  const [focused, setFocused] = useState(false);

  const isEmptyReadOnly = isReadOnly && !defaultValueProp && !valueProp;
  const defaultValue = isEmptyReadOnly ? emptyReadOnlyMarker : defaultValueProp;

  const {
    "aria-labelledby": inputLabelledBy,
    onBlur,
    onChange,
    onFocus,
    ...restInputProps
  } = inputProps;

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
    "--input-textAlign": textAlign,
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
      {startAdornment && (
        <div className={withBaseName("startAdornmentContainer")}>
          {startAdornment}
        </div>
      )}
      <input
        aria-labelledby={clsx(formFieldLabelledBy, inputLabelledBy)}
        className={clsx(withBaseName("input"), inputProps?.className)}
        disabled={isDisabled}
        id={id}
        readOnly={isReadOnly}
        ref={inputRef}
        role={role}
        tabIndex={isReadOnly || isDisabled ? -1 : 0}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={!isDisabled ? handleFocus : undefined}
        value={value}
        {...restA11yProps}
        {...restInputProps}
      />
      {!isDisabled && !isReadOnly && validationStatus && (
        <StatusAdornment status={validationStatus} />
      )}      
      {endAdornment && (
        <div className={withBaseName("endAdornmentContainer")}>
          {endAdornment}
        </div>
      )}
      <div className={withBaseName("activationIndicator")} />
    </div>
  );
});

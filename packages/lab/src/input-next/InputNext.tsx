import { clsx } from "clsx";
import {
  AriaAttributes,
  ChangeEvent,
  FocusEvent,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  useState,
} from "react";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context";
import { StatusAdornment } from "../status-adornment";

import "./InputNext.css";

const withBaseName = makePrefixer("saltInputNext");

// TODO: Double confirm whether this should be extending DivElement given root is `<div>`.
// And forwarded ref is not assigned to the root like other components.
export interface InputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * The value of the `input` element, required for an uncontrolled component.
   */
  defaultValue?: HTMLInputElement["defaultValue"];
  /**
   * If `true`, the component is disabled.
   */
  disabled?: HTMLInputElement["disabled"];
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Callback for change event.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  type?: HTMLInputElement["type"];
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

function mergeA11yProps(
  a11yProps: Partial<
    ReturnType<typeof useFormFieldPropsNext>["a11yProps"]
  > = {},
  inputProps: InputProps["inputProps"] = {},
  misplacedAriaProps: AriaAttributes
) {
  const ariaLabelledBy = clsx(
    a11yProps["aria-labelledby"],
    inputProps["aria-labelledby"]
  );

  return {
    ...misplacedAriaProps,
    ...a11yProps,
    ...inputProps,
    // TODO: look at this - The weird filtering is due to TokenizedInputBase
    "aria-label": ariaLabelledBy
      ? Array.from(new Set(ariaLabelledBy.split(" "))).join(" ")
      : undefined,
  };
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    "aria-activedescendant": ariaActiveDescendant,
    "aria-expanded": ariaExpanded,
    "aria-owns": ariaOwns,
    className: classNameProp,
    disabled,
    id,
    inputProps: inputPropsProp,
    onChange,
    readOnly: readOnlyProp,
    role,
    style,
    type = "text",
    value: valueProp,
    // If we leave both value and defaultValue undefined, we will get a React warning on first edit
    // (uncontrolled to controlled warning) from the React input
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
    a11yProps
  } = useFormFieldPropsNext();

  const isDisabled = disabled || formFieldDisabled;
  const isReadOnly = readOnlyProp || formFieldReadOnly;

  const validationStatus = formFieldValidationStatus ?? validationStatusProp;

  const [focused, setFocused] = useState(false);

  const misplacedAriaProps = {
    "aria-activedescendant": ariaActiveDescendant,
    "aria-expanded": ariaExpanded,
    "aria-owns": ariaOwns,
    role,
  };
  const inputProps = mergeA11yProps(
    a11yProps,
    inputPropsProp,
    misplacedAriaProps
  );

  const {
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onMouseUp,
    onMouseMove,
    onMouseDown,
    ...restInputProps
  } = inputProps;

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValueProp,
    name: "Input",
    state: "value",
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    onChange?.(event, value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    setFocused(false);
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event);
    setFocused(true);
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
      style={style}
      {...other}
    >
      <input
        type={type}
        id={id}
        className={clsx(
          withBaseName("input"),
          { [withBaseName("withAdornment")]: validationStatus },
          inputProps?.className
        )}
        disabled={isDisabled}
        readOnly={isReadOnly}
        ref={ref}
        value={value}
        tabIndex={isReadOnly || isDisabled ? -1 : 0}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={!isDisabled ? handleFocus : undefined}
        {...restInputProps}
      />
      {validationStatus && <StatusAdornment status={validationStatus} />}
    </div>
  );
});

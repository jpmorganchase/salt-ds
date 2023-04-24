import { clsx } from "clsx";
import {
  AriaAttributes,
  ChangeEvent,
  ElementType,
  FocusEvent,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEventHandler,
  MouseEvent,
  MouseEventHandler,
  useState,
} from "react";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { useFormFieldPropsNext } from "../form-field-context";

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
   * The HTML element to render the Input, e.g. 'input', a custom React component.
   */
  inputComponent?: ElementType;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  type?: HTMLInputElement["type"];
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
    "aria-labelledby": ariaLabelledBy
      ? Array.from(new Set(ariaLabelledBy.split(" "))).join(" ")
      : null,
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
    inputComponent: InputComponent = "input",
    inputProps: inputPropsProp,
    role,
    style,
    value: valueProp,
    // If we leave both value and defaultValue undefined, we will get a React warning on first edit
    // (uncontrolled to controlled warning) from the React input
    defaultValue: defaultValueProp = valueProp === undefined ? "" : undefined,
    readOnly: readOnlyProp,
    type = "text",
    variant = "primary",
    ...other
  },
  ref
) {
  const {
    a11yProps: {
      disabled: a11yDisabled,
      readOnly: a11yReadOnly,
      ...restA11y
    } = {},
  } = useFormFieldPropsNext();

  const isDisabled = disabled || a11yDisabled;
  const isReadOnly = readOnlyProp || a11yReadOnly;

  const [focused, setFocused] = useState(false);

  const misplacedAriaProps = {
    "aria-activedescendant": ariaActiveDescendant,
    "aria-expanded": ariaExpanded,
    "aria-owns": ariaOwns,
    role,
  };
  const inputProps = mergeA11yProps(
    restA11y,
    inputPropsProp,
    misplacedAriaProps
  );

  const {
    onBlur,
    onChange,
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
          [withBaseName(variant)]: variant,
        },
        classNameProp
      )}
      style={style}
      {...other}
    >
      <InputComponent
        type={type}
        id={id}
        className={clsx(withBaseName("input"), inputProps?.className)}
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
    </div>
  );
});

import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useFormFieldProps } from "../form-field-context";
import { makePrefixer, useControlled, useForkRef } from "../utils";
import { StatusAdornment } from "../status-adornment";
import { useCursorOnFocus } from "./internal/useCursorOnFocus";

import inputCss from "./Input.css";

const withBaseName = makePrefixer("saltInput");

export interface InputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  /**
   * Determines the position of the text cursor on focus of the Input
   *
   * start = place cursor at the beginning
   * end = place cursor at the end
   * number = index # to place the cursor
   */
  cursorPositionOnFocus?: "start" | "end" | number;
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
   * Determines what gets highlighted on focus of the input.
   *
   * If `true` all text will be highlighted.
   * If an array text between those indices will be highlighted
   * e.g. [0,1] will highlight the first character.
   */
  highlightOnFocus?: boolean | number[];
  onMouseUp?: MouseEventHandler<HTMLInputElement>;
  onMouseDown?: MouseEventHandler<HTMLInputElement>;
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
    cursorPositionOnFocus,
    disabled,
    emptyReadOnlyMarker = "—",
    endAdornment,
    highlightOnFocus,
    id,
    inputProps = {},
    inputRef: inputRefProp,
    onMouseDown,
    onMouseUp,
    placeholder,
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
      "aria-describedby": formFieldDescribedBy,
      "aria-labelledby": formFieldLabelledBy,
    } = {},
    disabled: formFieldDisabled,
    readOnly: formFieldReadOnly,
    validationStatus: formFieldValidationStatus,
  } = useFormFieldProps();

  const restA11yProps = {
    "aria-activedescendant": ariaActiveDescendant,
    "aria-expanded": ariaExpanded,
    "aria-owns": ariaOwns,
  };

  const isDisabled = disabled || formFieldDisabled;
  const isReadOnly = readOnlyProp || formFieldReadOnly;

  const validationStatus = formFieldValidationStatus ?? validationStatusProp;

  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);
  const handleRef = useForkRef(inputRef, inputRefProp);
  
  const cursorOnFocusHelpers = useCursorOnFocus(inputRef, {
    cursorPositionOnFocus,
    highlightOnFocus,
  });

  const isEmptyReadOnly = isReadOnly && !defaultValueProp && !valueProp;
  const defaultValue = isEmptyReadOnly ? emptyReadOnlyMarker : defaultValueProp;

  const {
    "aria-describedby": inputDescribedBy,
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

  const handleMouseUp = (event: MouseEvent<HTMLInputElement>) => {
    cursorOnFocusHelpers.handleMouseUp();

    onMouseUp?.(event);
  };

  const handleMouseDown = (event: MouseEvent<HTMLInputElement>) => {
    cursorOnFocusHelpers.handleMouseDown();

    onMouseDown?.(event);
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
        aria-describedby={clsx(formFieldDescribedBy, inputDescribedBy)}
        aria-labelledby={clsx(formFieldLabelledBy, inputLabelledBy)}
        className={clsx(withBaseName("input"), inputProps?.className)}
        disabled={isDisabled}
        id={id}
        readOnly={isReadOnly}
        ref={handleRef}
        role={role}
        tabIndex={isReadOnly || isDisabled ? -1 : 0}
        onBlur={handleBlur}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={!isDisabled ? handleFocus : undefined}
        placeholder={placeholder}
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

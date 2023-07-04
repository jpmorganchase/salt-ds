import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
  useState,
} from "react";
import { makePrefixer, StatusAdornment, useControlled } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import multilineInputCss from "./MultilineInput.css";

const withBaseName = makePrefixer("saltMultilineInput");

export interface MultilineInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
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
   * Styling variant with full border. Defaults to false
   */
  fullBorder?: boolean;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes) applied to the `textarea` element.
   */
  textAreaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  /**
   * Optional ref for the textarea component
   */
  textAreaRef?: Ref<HTMLTextAreaElement>;
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
  /**
   * Number of rows. Defaults to 3
   */
  rows?: number;
}

export const MultilineInput = forwardRef<HTMLDivElement, MultilineInputProps>(
  function MultilineInput(
    {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
      className: classNameProp,
      disabled,
      emptyReadOnlyMarker = "—",
      endAdornment,
      fullBorder = false,
      id,
      textAreaProps = {},
      textAreaRef,
      placeholder,
      readOnly,
      role,
      rows = 3,
      startAdornment,
      style,
      textAlign = "left",
      value: valueProp,
      defaultValue: defaultValueProp = valueProp === undefined ? "" : undefined,
      validationStatus,
      variant = "primary",
      ...other
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-multiline-input",
      css: multilineInputCss,
      window: targetWindow,
    });

    const restA11yProps = {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
    };

    const [focused, setFocused] = useState(false);

    const isEmptyReadOnly = readOnly && !defaultValueProp && !valueProp;
    const defaultValue = isEmptyReadOnly
      ? emptyReadOnlyMarker
      : defaultValueProp;

    const {
      "aria-describedby": textAreaDescribedBy,
      "aria-labelledby": textAreaLabelledBy,
      onBlur,
      onChange,
      onFocus,
      required,
      ...restTextAreaProps
    } = textAreaProps;

    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "MultilineInput",
      state: "value",
    });

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValue(value);
      onChange?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
      onBlur?.(event);
      setFocused(false);
    };

    const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
      onFocus?.(event);
      setFocused(true);
    };

    const multilineInputStyle = {
      "--multilineInput-textAlign": textAlign,
      ...style,
    };

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("fullBorder")]: fullBorder,
            [withBaseName("focused")]: !disabled && focused,
            [withBaseName("disabled")]: disabled,
            [withBaseName("readOnly")]: readOnly,
            [withBaseName(validationStatus || "")]: validationStatus,
          },
          classNameProp
        )}
        ref={ref}
        style={multilineInputStyle}
        {...other}
      >
        {startAdornment && (
          <div className={withBaseName("startAdornmentContainer")}>
            {startAdornment}
          </div>
        )}
        <textarea
          aria-describedby={textAreaDescribedBy}
          aria-labelledby={textAreaLabelledBy}
          className={clsx(withBaseName("textarea"), textAreaProps?.className)}
          disabled={disabled}
          id={id}
          readOnly={readOnly}
          ref={textAreaRef}
          role={role}
          rows={rows}
          tabIndex={readOnly || disabled ? -1 : 0}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={!disabled ? handleFocus : undefined}
          placeholder={placeholder}
          value={value}
          {...restA11yProps}
          {...restTextAreaProps}
          required={required}
        />
        {!disabled && !readOnly && validationStatus && (
          <div className={withBaseName("statusAdornmentContainer")}>
            <StatusAdornment status={validationStatus} />
          </div>
        )}
        {endAdornment && (
          <div className={withBaseName("endAdornmentContainer")}>
            {endAdornment}
          </div>
        )}
        <div className={withBaseName("activationIndicator")} />
      </div>
    );
  }
);

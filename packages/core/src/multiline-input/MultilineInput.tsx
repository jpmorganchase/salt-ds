import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useFormFieldProps } from "../form-field-context";
import { StatusAdornment } from "../status-adornment";
import type { DataAttributes } from "../types";
import { makePrefixer, useControlled, useForkRef } from "../utils";

import multilineInputCss from "./MultilineInput.css";

const withBaseName = makePrefixer("saltMultilineInput");

export interface MultilineInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"textarea">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  /**
   * Styling variant with full border. Defaults to false
   */
  bordered?: boolean;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * The default minimum number of rows. Defaults to 3
   */
  rows?: number;
  /**
   * Start adornment component
   */
  startAdornment?: ReactNode;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#Attributes) applied to the `textarea` element.
   */
  textAreaProps?: Partial<TextareaHTMLAttributes<HTMLTextAreaElement>> &
    DataAttributes;
  /**
   * Optional ref for the textarea component
   */
  textAreaRef?: Ref<HTMLTextAreaElement>;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
}

export const MultilineInput = forwardRef<HTMLDivElement, MultilineInputProps>(
  function MultilineInput(
    {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
      bordered = false,
      className: classNameProp,
      disabled,
      endAdornment,
      id,
      placeholder,
      readOnly,
      role,
      rows = 3,
      startAdornment,
      style,
      textAreaProps = {},
      textAreaRef,
      value: valueProp,
      defaultValue: defaultValueProp = valueProp === undefined ? "" : undefined,
      validationStatus: validationStatusProp,
      variant = "primary",
      ...other
    },
    ref,
  ) {
    const [inputElement, setInputElement] =
      useState<HTMLTextAreaElement | null>(null);
    const handleInputElement = useCallback(
      (element: HTMLTextAreaElement | null) => {
        setInputElement(element);
      },
      [],
    );
    const handleRef = useForkRef(handleInputElement, textAreaRef);

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

    const {
      "aria-describedby": textAreaDescribedBy,
      "aria-labelledby": textAreaLabelledBy,
      onBlur,
      onChange,
      onFocus,
      required: textAreaRequired,
      ...restTextAreaProps
    } = textAreaProps;

    const {
      a11yProps: {
        "aria-describedby": formFieldDescribedBy,
        "aria-labelledby": formFieldLabelledBy,
      } = {},
      disabled: formFieldDisabled,
      readOnly: formFieldReadOnly,
      necessity: formFieldRequired,
      validationStatus: formFieldValidationStatus,
    } = useFormFieldProps();

    const isDisabled = disabled || formFieldDisabled;
    const isReadOnly = readOnly || formFieldReadOnly;
    const validationStatus = formFieldValidationStatus ?? validationStatusProp;
    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : textAreaRequired;

    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValueProp,
      name: "MultilineInput",
      state: "value",
    });

    const previousHeight = useRef<string | undefined>(undefined);

    const changeHeight = useCallback(() => {
      const input = inputElement;

      if (!input) return;

      const hasBeenManuallyResized =
        previousHeight.current !== undefined &&
        input.style.height !== previousHeight.current;
      if (!hasBeenManuallyResized) {
        const previousOverflow = input.style.overflow;
        input.style.overflow = "hidden";
        input.style.height = "auto";
        input.scrollHeight; // Needed to work around Firefox bug. https://bugzilla.mozilla.org/show_bug.cgi?id=1787062
        const newHeight = `${
          input.scrollHeight + (input.offsetHeight - input.clientHeight)
        }px`;
        input.style.height = newHeight;
        previousHeight.current = newHeight;
        input.style.overflow = previousOverflow;
      }
    }, [inputElement]);

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValue(value);
      onChange?.(event);
      changeHeight();
    };

    useLayoutEffect(() => {
      changeHeight();
    }, [value, changeHeight]);

    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
      onBlur?.(event);
      setFocused(false);
    };

    const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
      onFocus?.(event);
      setFocused(true);
    };

    const multilineInputStyles = {
      "--saltMultilineInput-rows": rows,
      ...style,
    };

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("withAdornmentRow")]: endAdornment,
            [withBaseName("bordered")]: bordered,
            [withBaseName("focused")]: !isDisabled && focused,
            [withBaseName("disabled")]: isDisabled,
            [withBaseName("readOnly")]: isReadOnly,
            [withBaseName(validationStatus ?? "")]: validationStatus,
          },
          classNameProp,
        )}
        ref={ref}
        style={multilineInputStyles}
        {...other}
      >
        {startAdornment && (
          <div className={withBaseName("startAdornmentContainer")}>
            {startAdornment}
          </div>
        )}
        <div className={withBaseName("wrapper")}>
          <textarea
            aria-describedby={clsx(formFieldDescribedBy, textAreaDescribedBy)}
            aria-labelledby={clsx(formFieldLabelledBy, textAreaLabelledBy)}
            className={clsx(withBaseName("textarea"), textAreaProps?.className)}
            disabled={isDisabled}
            id={id}
            readOnly={isReadOnly}
            ref={handleRef}
            required={isRequired}
            role={role}
            rows={rows}
            tabIndex={isDisabled ? -1 : 0}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={!isDisabled ? handleFocus : undefined}
            placeholder={placeholder}
            value={value}
            {...restA11yProps}
            {...restTextAreaProps}
          />
        </div>
        <div className={withBaseName("suffixAdornments")}>
          {!isDisabled && validationStatus && (
            <div className={withBaseName("statusAdornmentContainer")}>
              <StatusAdornment status={validationStatus} />
            </div>
          )}
          {endAdornment && (
            <div className={withBaseName("endAdornmentContainer")}>
              {endAdornment}
            </div>
          )}
        </div>
        <div className={withBaseName("activationIndicator")} />
      </div>
    );
  },
);

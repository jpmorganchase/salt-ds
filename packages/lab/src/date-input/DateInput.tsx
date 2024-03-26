import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  Ref,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import dateInputCss from "./DateInput.css";
import { makePrefixer, useControlled, useFormFieldProps } from "@salt-ds/core";

const withBaseName = makePrefixer("saltDateInput");

export interface DateInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  /**
   * The marker to use in an empty read only DateInput.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes) applied to the `input` elements.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Optional ref for the dateInput component
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
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
   * Parser to format the input as date.
   */
  dateParser?: (input: string) => string;
}

const defaultDateParser = (input: string): string => {
  const date = new Date(input);

  // @ts-ignore evaluating validity of date
  return isNaN(date)
    ? input
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(input));
};
export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
      className: classNameProp,
      disabled,
      emptyReadOnlyMarker = "—",
      inputProps = {},
      inputRef,
      readOnly: readOnlyProp,
      role,
      style,
      textAlign = "left",
      value: valueProp,
      defaultValue: defaultStartDateProp = valueProp === undefined
        ? ""
        : undefined,
      validationStatus: validationStatusProp,
      variant = "primary",
      dateParser = defaultDateParser,
      placeholder = "dd mmm yyyy",
      ...other
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-dateInput",
      css: dateInputCss,
      window: targetWindow,
    });

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

    const restA11yProps = {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
    };

    const isDisabled = disabled || formFieldDisabled;
    const isReadOnly = readOnlyProp || formFieldReadOnly;
    const validationStatus = formFieldValidationStatus ?? validationStatusProp;

    const [focused, setFocused] = useState(false);

    const isEmptyReadOnly = isReadOnly && !defaultStartDateProp && !valueProp;
    const defaultValue = isEmptyReadOnly
      ? emptyReadOnlyMarker
      : defaultStartDateProp;

    const {
      "aria-describedby": dateInputDescribedBy,
      "aria-labelledby": dateInputLabelledBy,
      onBlur,
      onChange,
      onFocus,
      required: dateInputPropsRequired,
      ...restDateInputProps
    } = inputProps;

    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : dateInputPropsRequired;

    const [value, setValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "DateInput",
      state: "value",
    });

    const format = (date: string) => {
      const formattedDate = dateParser(date);
      setValue(formattedDate);
    };
    const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      onChange?.(event);
    };

    const handleStartDateBlur = (event: FocusEvent<HTMLInputElement>) => {
      value && format(value as string);
      onBlur?.(event);
      setFocused(false);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      setFocused(true);
    };

    const dateInputStyle = {
      "--dateInput-textAlign": textAlign,
      ...style,
    };

    return (
      <div
        className={clsx(
          withBaseName(),
          withBaseName(variant),
          {
            [withBaseName("focused")]: !isDisabled && focused,
            [withBaseName("disabled")]: isDisabled,
            [withBaseName("readOnly")]: isReadOnly,
            [withBaseName(validationStatus ?? "")]: validationStatus,
          },
          classNameProp
        )}
        ref={ref}
        style={dateInputStyle}
        {...other}
      >
        <input
          aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
          aria-labelledby={clsx(formFieldLabelledBy, dateInputLabelledBy)}
          className={clsx(withBaseName("input"), inputProps?.className)}
          disabled={isDisabled}
          readOnly={isReadOnly}
          ref={inputRef}
          role={role}
          tabIndex={isDisabled ? -1 : 0}
          onBlur={handleStartDateBlur}
          onChange={handleStartDateChange}
          onFocus={!isDisabled ? handleFocus : undefined}
          placeholder={placeholder}
          value={value}
          {...restA11yProps}
          {...restDateInputProps}
          required={isRequired}
        />
        <div className={withBaseName("activationIndicator")} />
      </div>
    );
  }
);

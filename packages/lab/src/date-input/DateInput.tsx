import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  KeyboardEvent,
  Ref,
  useState,
} from "react";
import {useComponentCssInjection} from "@salt-ds/styles";
import {useWindow} from "@salt-ds/window";

import dateInputCss from "./DateInput.css";
import {
  Button,
  makePrefixer,
  useControlled,
  useFormFieldProps
} from "@salt-ds/core";
import {DateFormatter} from "@internationalized/date";
import {CalendarIcon} from "@salt-ds/icons";
import {useDatePickerContext} from "../date-picker/DatePickerContext";

const withBaseName = makePrefixer("saltDateInput");

const isInvalidDate = (value: string) =>
  // @ts-ignore evaluating validity of date
  value && isNaN(new Date(value));

const defaultDateFormatter = (input: string): string => {
  const date = new Date(input);

  return isInvalidDate(input)
    ? input
    : new DateFormatter("EN-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
};

export interface DateInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "placeholder"
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
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary";
  /**
   * Function to format the input value.
   */
  dateFormatter?: (input: string) => string;
  startDate?: string,
  defaultStartDate?: string,
}

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
      "aria-activedescendant": ariaActiveDescendant,
      "aria-expanded": ariaExpanded,
      "aria-owns": ariaOwns,
      className,
      disabled,
      emptyReadOnlyMarker = "—",
      inputProps = {},
      inputRef,
      readOnly: readOnlyProp,
      role,
      startDate: startDateProp,
      defaultStartDate: defaultStartDateProp = startDateProp === undefined
        ? ""
        : undefined,
      validationStatus: validationStatusProp,
      variant = "primary",
      dateFormatter = defaultDateFormatter,
      placeholder = "dd mmm yyyy",
      ...rest
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

    const isReadOnly = readOnlyProp || formFieldReadOnly;
    const isEmptyReadOnly = isReadOnly && !defaultStartDateProp && !startDateProp;
    const defaultStartDate = isEmptyReadOnly
      ? emptyReadOnlyMarker
      : defaultStartDateProp;
    const [startDate, setStartDate] = useControlled({
      controlled: startDateProp,
      default: defaultStartDate,
      name: "DateInput",
      state: "value",
    });

    const getDateValidationStatus = (value: string | undefined) =>
      value && isInvalidDate(value) ? "error" : undefined;

    const [dateStatus, setDateStatus] = useState<"error" | undefined>(
      getDateValidationStatus(startDate)
    );

    const isDisabled = disabled || formFieldDisabled;
    const validationStatus =
      dateStatus ?? formFieldValidationStatus ?? validationStatusProp;

    const [focused, setFocused] = useState(false);

    const {
      "aria-describedby": dateInputDescribedBy,
      "aria-labelledby": dateInputLabelledBy,
      onBlur,
      onChange,
      onFocus,
      onKeyDown,
      required: dateInputPropsRequired,
      ...restDateInputProps
    } = inputProps;

    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : dateInputPropsRequired;

    const {openState, setOpen, selectionVariant} =
      useDatePickerContext();

    const format = (date: string) => {
      const formattedDate = dateFormatter(date);
      setStartDate(formattedDate);
    };
    const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
      setStartDate(event.target.value);
      onChange?.(event);
    };

    const handleStartDateBlur = (event: FocusEvent<HTMLInputElement>) => {
      startDate && format(startDate);
      onBlur?.(event);
      setDateStatus(getDateValidationStatus(startDate));
      setFocused(false);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      setFocused(true);
      setOpen(true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Tab" && event.shiftKey) {
        setOpen(false);
      }
      onKeyDown?.(event);
    };

    const activeInput = selectionVariant === "default" && openState;

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
          className
        )}
        ref={ref}
        {...rest}
      >
        <input
          aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
          aria-labelledby={clsx(formFieldLabelledBy, dateInputLabelledBy)}
          className={clsx(withBaseName("input"), {
            [withBaseName("active")]: activeInput,
          })}
          disabled={isDisabled}
          readOnly={isReadOnly}
          ref={inputRef}
          role={role}
          tabIndex={isDisabled ? -1 : 0}
          onBlur={handleStartDateBlur}
          onChange={handleStartDateChange}
          onKeyDown={handleKeyDown}
          onFocus={!isDisabled ? handleFocus : undefined}
          placeholder={placeholder}
          value={startDate ?? ""}
          {...restA11yProps}
          {...restDateInputProps}
          required={isRequired}
        />
        {
          <div className={withBaseName("endAdornmentContainer")}>
            <Button variant="secondary" onClick={() => setOpen(!openState)}>
              <CalendarIcon />
            </Button>
          </div>
        }
        <div className={withBaseName("activationIndicator")} />
      </div>
    );
  }
);

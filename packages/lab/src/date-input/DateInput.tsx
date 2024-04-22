import { clsx } from "clsx";
import {
  ChangeEvent,
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import dateInputCss from "./DateInput.css";
import { makePrefixer, useFormFieldProps } from "@salt-ds/core";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  parseAbsolute,
} from "@internationalized/date";
import { useDatePickerContext } from "../date-picker/DatePickerContext";

const withBaseName = makePrefixer("saltDateInput");
const isInvalidDate = (value: string) =>
  // @ts-ignore evaluating validity of date
  value && isNaN(new Date(value));
const createDate = (date: string): Date | null => {
  try {
    return isInvalidDate(date) ? null : new Date(date);
  } catch (err) {
    return null;
  }
};

const defaultDateFormatter = (input: string): string => {
  const date = createDate(input);
  return !date
    ? input
    : new DateFormatter("EN-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
};

export interface DateInputProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<ComponentPropsWithoutRef<"input">, "disabled" | "placeholder"> {
  /**
   * The marker to use in an empty read only DateInput.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component
   */
  endAdornment?: ReactNode;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes) applied to the `input` elements.
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
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
  selectionVariant?: "default" | "range";
}

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  function DateInput(
    {
      className,
      disabled,
      emptyReadOnlyMarker = "—",
      inputProps = {},
      endAdornment,
      readOnly: readOnlyProp,
      // startDateValue: startDateValueProp,
      // endDate: endDateProp,
      // defaultStartDate: defaultStartDateProp,
      // defaultEndDate: defaultEndDateProp,
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

    const { startDate, endDate, setStartDate, selectionVariant } =
      useDatePickerContext();

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

    const isReadOnly = readOnlyProp || formFieldReadOnly;

    const getDateValidationStatus = (value: string | undefined) =>
      value && isInvalidDate(value) ? "error" : undefined;

    const [startDateStringValue, setStartDateStringValue] = useState<string>(
      startDate?.toString() ?? ""
    );
    const [endDateStringValue, setEndDateStringValue] = useState<string>(
      endDate?.toString ?? ""
    );
    // const [dateStatus, setDateStatus] = useState<"error" | undefined>(getDateValidationStatus(startDate));
    const isDisabled = disabled || formFieldDisabled;
    const dateStatus = useMemo(
      () => getDateValidationStatus(startDateStringValue),
      [startDateStringValue]
    );
    const validationStatus =
      dateStatus ?? formFieldValidationStatus ?? validationStatusProp;

    const [focused, setFocused] = useState(false);

    const {
      "aria-describedby": dateInputDescribedBy,
      "aria-labelledby": dateInputLabelledBy,
      onBlur,
      onChange,
      onFocus,
      required: dateInputPropsRequired,
      ...restDateInputProps
    } = inputProps;

    // Effects. Update date strings when dates change
    useEffect(() => {
      if (startDate) {
        setStartDateStringValue(dateFormatter(startDate.toString()));
      }
    }, [startDate]);
    useEffect(() => {
      if (endDate) {
        setEndDateStringValue(dateFormatter(endDate.toString()));
      }
    }, [endDate]);

    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : dateInputPropsRequired;

    const updateDate = (inputDate: string, startDate: string) => {
      if (validationStatus) {
        return;
      }
      if (startDate !== inputDate) {
        const isoDate = parseAbsolute(
          createDate(inputDate)?.toISOString() ?? "",
          getLocalTimeZone()
        );
        setStartDate(
          new CalendarDate(isoDate.year, isoDate.month, isoDate.day)
        );
      }
    };
    const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
      setStartDateStringValue(event.target.value);
      onChange?.(event);
    };

    const handleStartDateBlur = (event: FocusEvent<HTMLInputElement>) => {
      const targetDateValue = dateFormatter(event.target.value);
      const startDateValue = startDate
        ? dateFormatter(startDate.toString())
        : "";
      updateDate(targetDateValue, startDateValue);
    };

    // const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    //   setEndDate(event.target.value);
    //   onChange?.(event);
    // };

    // const handleEndDateBlur = (event: FocusEvent<HTMLInputElement>) => {
    //   // startDate && format(startDate);
    //   onBlur?.(event);
    //   setFocused(false);
    // };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      setFocused(true);
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
          className
        )}
        ref={ref}
        {...rest}
      >
        <input
          aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
          aria-labelledby={clsx(formFieldLabelledBy, dateInputLabelledBy)}
          className={withBaseName("input")}
          disabled={isDisabled}
          readOnly={isReadOnly}
          tabIndex={isDisabled ? -1 : 0}
          onBlur={handleStartDateBlur}
          onChange={handleStartDateChange}
          // onKeyDown={handleStartDateKeyDown} // TODO: update and return the focus
          onFocus={!isDisabled ? handleFocus : undefined}
          placeholder={placeholder}
          value={startDateStringValue}
          {...restDateInputProps}
          required={isRequired}
        />
        {selectionVariant === "range" && (
          <input
            aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
            aria-labelledby={clsx(formFieldLabelledBy, dateInputLabelledBy)}
            className={withBaseName("input")}
            disabled={isDisabled}
            readOnly={isReadOnly}
            tabIndex={isDisabled ? -1 : 0}
            // onBlur={handleEndDateBlur}
            // onChange={handleEndDateChange}
            placeholder={placeholder}
            value={endDateStringValue}
            {...restDateInputProps}
            required={isRequired}
          />
        )}
        {
          <div className={withBaseName("endAdornmentContainer")}>
            {endAdornment}
          </div>
        }
        <div className={withBaseName("activationIndicator")} />
      </div>
    );
  }
);

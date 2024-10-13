import { type DateValue, getLocalTimeZone } from "@internationalized/date";
import {
  type InputProps,
  makePrefixer,
  StatusAdornment,
  useControlled,
  useForkRef,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEvent,
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  formatDate as defaultFormatDate,
  getCurrentLocale,
  type DateRangeSelection,
} from "../calendar";
import dateInputCss from "./DateInput.css";
import {
  type DateInputParserDetails,
  extractTimeFieldsFromDateRange,
  parseCalendarDate,
  type RangeTimeFields,
} from "./utils";
import { DateInputRangeDetails } from "../date-picker";

const withBaseName = makePrefixer("saltDateInput");

/**
 * DateInputRange raw value or null if no date is defined.
 */
export type DateInputRangeValue = {
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * Props for the DateInputRange component.
 * @template T
 */
export interface DateInputRangeProps<T = DateValue>
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange">,
    Omit<InputProps, "defaultValue" | "inputRef" | "value" | "onChange"> {
  /**
   * The aria-label for accessibility.
   */
  ariaLabel?: string;
  /**
   * Styling variant with full border. Defaults to false.
   */
  bordered?: boolean;
  /**
   * The marker to use in an empty read-only DateInput.
   * Use `''` to disable this feature. Defaults to '—'.
   */
  emptyReadOnlyMarker?: string;
  /**
   * End adornment component.
   */
  endAdornment?: ReactNode;
  /**
   * Attributes applied to the start `input` element.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes
   */
  startInputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Attributes applied to the end `input` element.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes
   */
  endInputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * If `true`, the component is read-only.
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
  format?: (date: T | null) => string;
  /**
   * Optional ref for the start input component.
   */
  startInputRef?: Ref<HTMLInputElement>;
  /**
   * Optional ref for the end input component.
   */
  endInputRef?: Ref<HTMLInputElement>;
  /**
   * Input value. Use when the input value is controlled.
   */
  value?: DateInputRangeValue;
  /**
   * The initial input value. Use when the component is uncontrolled.
   */
  defaultValue?: DateInputRangeValue;
  /**
   * The date value. Use when the component is controlled.
   */
  date?: DateRangeSelection<T> | null;
  /**
   * The initial selected date value. Use when the component is uncontrolled.
   */
  defaultDate?: DateRangeSelection | null;
  /**
   * Callback fired when the input value changes.
   * @param event - The change event.
   * @param date - The new date input range value.
   */
  onChange?: (
    event: ChangeEvent<HTMLInputElement>,
    value: DateInputRangeValue,
  ) => void;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param date - the selected date, null if in not a valid date or undefined if not defined
   * @param details - The details of date selection, either a valid date or error
   */
  onDateChange?: (
    event: SyntheticEvent,
    date: DateRangeSelection,
    details: DateInputRangeDetails,
  ) => void;
  /**
   * Called when input values change, either due to user interaction or programmatic formatting of valid dates.
   * @param newValue - The new date input range value.
   * @param isFormatted - Whether the value is formatted.
   */
  onDateValueChange?: (
    newValue: DateInputRangeValue,
    isFormatted: boolean,
  ) => void;
  /**
   * Function to parse date string to valid `DateValue` or null, if invalid.
   * @param inputDate - The input date string.
   * @param locale - the locale for the parsed date
   * @returns The details of parsing the date.
   */
  parse?: (inputDate: string, locale: string) => DateInputParserDetails;
  /**
   * Locale of the entered date.
   */
  locale?: string;
  /**
   * Timezone of the entered date.
   */
  timeZone?: string;
}

export const DateInputRange = forwardRef<HTMLDivElement, DateInputRangeProps>(
  function DateInputRange(props, ref) {
    const {
      bordered = false,
      className,
      disabled,
      "aria-label": ariaLabel,
      date: dateProp,
      defaultDate = {},
      onDateChange,
      value: valueProp,
      defaultValue = { startDate: "", endDate: "" },
      onChange,
      onClick,
      onDateValueChange,
      emptyReadOnlyMarker = "—",
      endAdornment,
      format: formatProp,
      startInputProps = {},
      endInputProps = {},
      startInputRef: startInputRefProp,
      endInputRef: endInputRefProp,
      parse = parseCalendarDate,
      placeholder = "dd mmm yyyy",
      readOnly: readOnlyProp,
      validationStatus: validationStatusProp,
      variant = "primary",
      locale = getCurrentLocale(),
      timeZone = getLocalTimeZone(),
      ...rest
    } = props;
    const wrapperRef = useRef(null);
    const handleWrapperRef = useForkRef<HTMLDivElement>(ref, wrapperRef);

    const startInputRef = useRef<HTMLInputElement>(null);
    const handleStartInputRef = useForkRef(startInputRef, startInputRefProp);
    const endInputRef = useRef<HTMLInputElement>(null);
    const handleEndInputRef = useForkRef(endInputRef, endInputRefProp);

    const startInputID = useId();
    const endInputID = useId();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-input-range",
      css: dateInputCss,
      window: targetWindow,
    });

    const [date, setDate] = useControlled({
      controlled: dateProp,
      default: defaultDate,
      name: "DateInputRange",
      state: "date",
    });
    const [dateValue, setDateValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "DateInputRange",
      state: "dateValue",
    });

    const lastAppliedValue = useRef<DateInputRangeValue>(dateValue);
    const preservedTime = useRef<RangeTimeFields>({});
    preservedTime.current = extractTimeFieldsFromDateRange(date);

    const format = useCallback(
      (date: DateValue | null) => {
        return formatProp
          ? formatProp(date)
          : defaultFormatDate(date, locale, { timeZone });
      },
      [formatProp, locale, timeZone],
    );

    const setDateValueFromDate = (newDate: DateInputRangeProps["date"]) => {
      let newDateValue = { ...dateValue };
      // If start date value is defined or null (invalid date) use formatted value
      if (newDate?.startDate !== undefined) {
        const formattedStartDate = format(newDate.startDate);
        if (formattedStartDate) {
          newDateValue = { ...newDateValue, startDate: formattedStartDate };
        }
      } else {
        // If start date value is undefined then a new selection is created so empty string
        newDateValue = { ...newDateValue, startDate: "" };
      }
      if (newDate?.endDate !== undefined) {
        const formattedEndDate = format(newDate.endDate);
        if (formattedEndDate) {
          newDateValue = { ...newDateValue, endDate: formattedEndDate };
        }
      } else {
        newDateValue = { ...newDateValue, endDate: "" };
      }
      if (
        newDateValue?.startDate !== dateValue?.startDate ||
        newDateValue?.endDate !== dateValue?.endDate
      ) {
        onDateValueChange?.(newDateValue, true);
      }
      setDateValue(newDateValue);
    };

    // Update date string value when selected date changes
    useEffect(() => {
      setDateValueFromDate(date);
    }, [date, date?.startDate, date?.endDate]);

    const [focused, setFocused] = useState(false);

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
    const isDisabled = disabled || formFieldDisabled;

    const validationStatus = formFieldValidationStatus ?? validationStatusProp;

    const {
      "aria-describedby": startInputPropsDescribedBy,
      "aria-labelledby": startInputPropsLabelledBy,
      onBlur: startInputPropsOnBlur,
      onChange: startInputPropsOnChange,
      onKeyDown: startInputPropsOnKeyDown,
      onFocus: startInputPropsOnFocus,
      required: startInputPropsRequired,
      ...restStartInputProps
    } = startInputProps;

    const startInputIsRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : startInputPropsRequired;

    const {
      "aria-describedby": endInputPropsDescribedBy,
      "aria-labelledby": endInputPropsLabelledBy,
      onBlur: endInputPropsOnBlur,
      onChange: endInputPropsOnChange,
      onKeyDown: endInputPropsOnKeyDown,
      onFocus: endInputPropsOnFocus,
      required: endInputPropsRequired,
      ...restEndInputProps
    } = endInputProps;

    const endInputIsRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : endInputPropsRequired;

    const apply = (event: SyntheticEvent) => {
      const startDateParseDetails = parse(dateValue.startDate ?? "", locale);
      const endDateParseDetails = parse(dateValue.endDate || "", locale);

      const hasStartDateChanged =
        startDateParseDetails.date && date?.startDate
          ? startDateParseDetails.date.compare(date.startDate) === 0
          : false;
      const hasEndDateChanged =
        endDateParseDetails.date && date?.endDate
          ? endDateParseDetails.date.compare(date.endDate) === 0
          : false;

      let updatedDateRange = {
        startDate: startDateParseDetails.date,
        endDate: endDateParseDetails.date,
      };
      setDateValueFromDate(updatedDateRange);
      setDate(updatedDateRange);

      if (
        hasStartDateChanged &&
        updatedDateRange.startDate &&
        preservedTime.current.startTime
      ) {
        updatedDateRange.startDate = updatedDateRange.startDate.set(
          preservedTime.current.startTime,
        );
      }
      if (
        hasEndDateChanged &&
        updatedDateRange?.endDate &&
        preservedTime.current.endTime
      ) {
        updatedDateRange.endDate = updatedDateRange.endDate.set(
          preservedTime.current.endTime,
        );
      }

      if (
        lastAppliedValue.current.startDate !== dateValue.startDate ||
        lastAppliedValue.current.endDate !== dateValue.endDate
      ) {
        let updatedDetails = {
          startDate: {
            ...startDateParseDetails,
            date: updatedDateRange.startDate,
          },
          endDate: { ...endDateParseDetails, date: updatedDateRange.endDate },
        };
        onDateChange?.(event, updatedDateRange, updatedDetails);
      }
      lastAppliedValue.current = { ...dateValue };
    };

    const handleStartInputChange: ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const newDateValue = { ...dateValue, startDate: event.target.value };
      setDateValue(newDateValue);
      startInputPropsOnChange?.(event);
      onChange?.(event, newDateValue);
      onDateValueChange?.(newDateValue, false);
    };

    const handleEndInputChange: ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const newDateValue = { ...dateValue, endDate: event.target.value };
      setDateValue(newDateValue);
      endInputPropsOnChange?.(event);
      onChange?.(event, newDateValue);
      onDateValueChange?.(newDateValue, false);
    };

    const handleStartInputFocus: FocusEventHandler<HTMLInputElement> = (
      event,
    ) => {
      setFocused(true);
      startInputPropsOnFocus?.(event);
    };

    const handleEndInputFocus: FocusEventHandler<HTMLInputElement> = (
      event,
    ) => {
      setFocused(true);
      endInputPropsOnFocus?.(event);
    };

    const handleStartInputBlur: FocusEventHandler<HTMLInputElement> = (
      event,
    ) => {
      setFocused(false);
      apply(event);
      startInputPropsOnBlur?.(event);
    };

    const handleEndInputBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      setFocused(false);
      apply(event);
      endInputPropsOnBlur?.(event);
    };

    const handleStartInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
      event,
    ) => {
      if (event.key === "Enter") {
        apply(event);
      }
      startInputPropsOnKeyDown?.(event);
    };

    const handleEndInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
      event,
    ) => {
      if (event.key === "Enter") {
        apply(event);
      }
      endInputPropsOnKeyDown?.(event);
    };

    const handleWrapperClick: MouseEventHandler<HTMLDivElement> = (event) => {
      if (event.target === wrapperRef.current) {
        const input = startInputRef.current;
        input?.focus();
        input?.setSelectionRange(input.value.length, input.value.length);
      }
      onClick?.(event);
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
            [withBaseName("bordered")]: bordered,
          },
          className,
        )}
        ref={handleWrapperRef}
        onClick={handleWrapperClick}
        {...rest}
      >
        <input
          autoComplete="off"
          aria-describedby={clsx(
            formFieldDescribedBy,
            startInputPropsDescribedBy,
          )}
          aria-labelledby={clsx(
            formFieldLabelledBy,
            startInputPropsLabelledBy,
            startInputID,
          )}
          aria-label={clsx("Start date", ariaLabel)}
          id={startInputID}
          className={withBaseName("input")}
          disabled={isDisabled}
          readOnly={isReadOnly}
          ref={handleStartInputRef}
          tabIndex={isDisabled ? -1 : 0}
          placeholder={placeholder}
          size={placeholder.length}
          value={
            isReadOnly && !dateValue?.startDate
              ? emptyReadOnlyMarker
              : (dateValue.startDate ?? "")
          }
          {...restStartInputProps}
          onBlur={handleStartInputBlur}
          onChange={handleStartInputChange}
          onKeyDown={handleStartInputKeyDown}
          onFocus={!isDisabled ? handleStartInputFocus : undefined}
          required={startInputIsRequired}
        />
        <span>-</span>
        <input
          autoComplete="off"
          aria-describedby={clsx(
            formFieldDescribedBy,
            endInputPropsDescribedBy,
          )}
          aria-labelledby={clsx(
            formFieldLabelledBy,
            endInputPropsLabelledBy,
            endInputID,
          )}
          aria-label={clsx("End date", ariaLabel)}
          id={endInputID}
          className={withBaseName("input")}
          disabled={isDisabled}
          readOnly={isReadOnly}
          ref={handleEndInputRef}
          tabIndex={isDisabled ? -1 : 0}
          placeholder={placeholder}
          size={placeholder.length}
          value={
            isReadOnly && !dateValue?.endDate
              ? emptyReadOnlyMarker
              : (dateValue.endDate ?? "")
          }
          {...restEndInputProps}
          onBlur={handleEndInputBlur}
          onChange={handleEndInputChange}
          onKeyDown={handleEndInputKeyDown}
          onFocus={!isDisabled ? handleEndInputFocus : undefined}
          required={endInputIsRequired}
        />
        <div className={withBaseName("endAdornmentContainer")}>
          {!isDisabled && !isReadOnly && validationStatus && (
            <StatusAdornment status={validationStatus} />
          )}
          {endAdornment}
        </div>
        <div className={withBaseName("activationIndicator")} />
      </div>
    );
  },
);

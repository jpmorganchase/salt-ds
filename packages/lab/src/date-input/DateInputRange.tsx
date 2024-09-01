import { type DateValue, getLocalTimeZone } from "@internationalized/date";
import {
  type InputProps,
  StatusAdornment,
  makePrefixer,
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
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type DateRangeSelection,
  formatDate as defaultFormatDate,
  getCurrentLocale,
} from "../calendar";
import dateInputCss from "./DateInput.css";
import type { DateInputSingleParserError } from "./DateInputSingle";
import {
  type RangeTimeFields,
  extractTimeFieldsFromDateRange,
  parseCalendarDate,
} from "./utils";

const withBaseName = makePrefixer("saltDateInput");

export type DateInputRangeValue = {
  startDate?: string | null;
  endDate?: string | null;
};

export type DateInputRangeParserError = string | false;
export interface DateInputRangeParserResult<T = DateValue | null> {
  date: T;
  error: DateInputRangeParserError;
}
export type DateInputRangeError = {
  startDate: DateInputSingleParserError;
  endDate: DateInputSingleParserError;
};

export interface DateInputRangeProps<T = DateRangeSelection>
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange">,
    Omit<InputProps, "defaultValue" | "inputRef" | "value" | "onChange"> {
  ariaLabel?: string;
  /**
   * Styling variant with full border. Defaults to false
   */
  bordered?: boolean;
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
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes) applied to the start `input` element.
   */
  startInputProps?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes) applied to the end `input` element.
   */
  endInputProps?: InputHTMLAttributes<HTMLInputElement>;
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
  formatDate?: typeof defaultFormatDate;
  /**
   * Optional ref for the start input component
   */
  startInputRef?: Ref<HTMLInputElement>;
  /**
   * Optional ref for the end input component
   */
  endInputRef?: Ref<HTMLInputElement>;
  /**
   * Input value.
   * Use when the input value is controlled.
   */
  value?: DateInputRangeValue;
  /**
   * The initial input value. Use when the component is un-controlled.
   */
  defaultValue?: DateInputRangeValue;
  /**
   * The  date value. Use when the component is controlled.
   */
  date?: T | null;
  /**
   * The initial selected date value. Use when the component is un-controlled.
   */
  defaultDate?: T | null;
  /**
   * Callback fired when the selected date change.
   */
  /**
   * Callback fired when the input value change.
   */
  onChange?: (
    event: ChangeEvent<HTMLInputElement>,
    date: DateInputRangeValue,
  ) => void;
  onDateChange?: (
    event: SyntheticEvent,
    date: T | null,
    error: DateInputRangeError,
  ) => void;
  /**
   * Called when input values changes, either due to user-interaction or programmatic formatting of valid dates
   */
  onDateValueChange?: (
    newValue: DateInputRangeValue,
    isFormatted: boolean,
  ) => void;
  /**
   * @param inputDate - parse date string to valid `DateValue` or null, if invalid
   */
  parse?: (inputDate: string) => DateInputRangeParserResult;
  locale?: string;
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
      formatDate = defaultFormatDate,
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
    const lastError = useRef<{
      startDate: DateInputRangeParserError;
      endDate: DateInputRangeParserError;
    }>({
      startDate: false,
      endDate: false,
    });

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

    const preservedTime = useRef<RangeTimeFields>({});
    preservedTime.current = extractTimeFieldsFromDateRange(date);

    const setDateValueFromDate = (newDate: DateInputRangeProps["date"]) => {
      let newDateValue = { ...dateValue };
      const formattedStartDate = formatDate(
        newDate?.startDate ?? null,
        locale,
        {
          timeZone,
        },
      );
      if (formattedStartDate) {
        newDateValue = { ...newDateValue, startDate: formattedStartDate };
      }
      const formattedEndDate = formatDate(newDate?.endDate ?? null, locale, {
        timeZone,
      });
      if (formattedEndDate) {
        newDateValue = { ...newDateValue, endDate: formattedEndDate };
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
      const { date: newStartDate, error: startDateError } = parse(
        dateValue.startDate ?? "",
      );
      const { date: newEndDate, error: endDateError } = parse(
        dateValue.endDate || "",
      );

      const hasDateChanged = (
        newDate: DateValue | null,
        oldDate: DateValue | null,
      ): boolean => {
        if (newDate && oldDate) {
          return newDate.compare(oldDate) !== 0;
        }
        return newDate !== oldDate;
      };

      const createNewDateRange = (
        startDate: DateValue | null,
        endDate: DateValue | null,
      ): DateRangeSelection | null => {
        if (!startDate && !endDate) {
          return null;
        }

        const dateRange: DateRangeSelection = {};
        dateRange.startDate = startDate;
        dateRange.endDate = endDate;

        return dateRange;
      };

      const hasStartDateChanged = hasDateChanged(
        newStartDate,
        date?.startDate || null,
      );
      const hasEndDateChanged = hasDateChanged(
        newEndDate,
        date?.endDate || null,
      );
      const hasStartOrEndDateChanged = hasStartDateChanged || hasEndDateChanged;

      const newDate: DateRangeSelection | null = createNewDateRange(
        newStartDate,
        newEndDate,
      );

      if (newDate?.startDate || newDate?.endDate) {
        setDateValueFromDate(newDate);
      }

      if (hasStartOrEndDateChanged) {
        setDate(newDate);
        if (newDate?.startDate && preservedTime.current.startTime) {
          newDate.startDate = newDate.startDate.set(
            preservedTime.current.startTime,
          );
        }
        if (newDate?.endDate && preservedTime.current.endTime) {
          newDate.endDate = newDate.endDate.set(preservedTime.current.endTime);
        }
      }
      const error = {
        startDate: startDateError,
        endDate: endDateError,
      };
      if (
        hasStartOrEndDateChanged ||
        lastError.current.startDate !== error.startDate ||
        lastError.current.endDate !== error.endDate
      ) {
        const error = {
          startDate: startDateError,
          endDate: endDateError,
        };
        onDateChange?.(event, newDate, error);
        lastError.current = error;
      }
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
              : dateValue.startDate ?? ""
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
              : dateValue.endDate ?? ""
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

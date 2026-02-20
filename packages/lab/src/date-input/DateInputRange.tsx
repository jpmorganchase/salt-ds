import {
  type InputProps,
  makePrefixer,
  StatusAdornment,
  useControlled,
  useForkRef,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import type {
  DateDetail,
  DateFrameworkType,
  ParserResult,
  TimeFields,
  Timezone,
} from "@salt-ds/date-adapters";
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
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DateRangeSelection } from "../calendar";
import { useLocalization } from "../localization-provider";
import dateInputCss from "./DateInput.css";

const withBaseName = makePrefixer("saltDateInput");

/**
 * DateInputRange raw value or null if no date is defined.
 */
export type DateInputRangeValue = {
  startDate?: string | null;
  endDate?: string | null;
};

/**
 * Details of parsing the date range
 */
export type DateInputRangeDetails = {
  /** Details of parsing the start date and applying any validation */
  startDate?: DateDetail;
  /** Details of parsing the end date and applying any validation */
  endDate?: DateDetail;
};

/**
 * Enum to identify the field being parsed
 */
export enum DateParserField {
  START = "start",
  END = "end",
}

/**
 * Props for the DateInputRange component.
 * @template TDate - The type of the date object.
 */
export interface DateInputRangeProps<TDate extends DateFrameworkType>
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
   * Format string for date.
   */
  format?: string;
  /**
   * Optional ref for the start input component.
   */
  startInputRef?: Ref<HTMLInputElement>;
  /**
   * Optional ref for the end input component.
   */
  endInputRef?: Ref<HTMLInputElement>;
  /**
   * Parser callback, if not using the adapter's parser
   * @param value - date string to parse
   * @param field: DateParserField to identify value,
   * @param format - format required
   */
  parse?: (
    value: string,
    field: DateParserField,
    format: string,
  ) => ParserResult<TDate>;
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
  date?: DateRangeSelection<TDate> | null;
  /**
   * The initial selected date value. Use when the component is uncontrolled.
   */
  defaultDate?: DateRangeSelection<TDate> | null;
  /**
   * Callback fired when the input value changes.
   * @param event - The change event.
   * @param date - The new date input range value.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param date - the selected date, invalid date if not a valid date or undefined (uncontrolled) or null (controlled) if not defined
   * @param details - The details of date selection, either a valid date or error
   */
  onDateChange?: (
    event: SyntheticEvent,
    date: DateRangeSelection<TDate> | null,
    details: DateInputRangeDetails,
  ) => void;
  /**
   * Called when input values change, either due to user interaction or programmatic formatting of valid dates.
   * @param event - The synthetic event or null if a programmatic change.
   * @param newValue - The new date input range value.
   */
  onDateValueChange?: (
    event: SyntheticEvent | null,
    newValue: DateInputRangeValue,
  ) => void;
  /**
   * Specifies the timezone behavior:
   * - If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate`.
   * - If set to "default", the default timezone of the date library will be used.
   * - If set to "system", the local system's timezone will be applied.
   * - If set to "UTC", the time will be returned in UTC.
   * - If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
   */
  timezone?: Timezone;
}

export const DateInputRange = forwardRef<
  HTMLDivElement,
  DateInputRangeProps<DateFrameworkType>
>(
  <TDate extends DateFrameworkType>(
    props: DateInputRangeProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const { dateAdapter } = useLocalization<TDate>();
    const {
      bordered = false,
      className,
      disabled,
      "aria-label": ariaLabel,
      date: dateProp,
      defaultDate,
      onDateChange,
      value: valueProp,
      format = "DD MMM YYYY",
      defaultValue = {
        startDate: "",
        endDate: "",
      },
      onChange,
      onClick,
      onDateValueChange,
      emptyReadOnlyMarker = "—",
      endAdornment,
      startInputProps = {},
      endInputProps = {},
      startInputRef: startInputRefProp,
      endInputRef: endInputRefProp,
      parse: parseProp,
      placeholder = format.toLowerCase(),
      readOnly: readOnlyProp,
      validationStatus: validationStatusProp,
      variant = "primary",
      timezone = dateProp?.startDate || defaultDate?.startDate
        ? dateAdapter.getTimezone(
            (dateProp?.startDate ?? defaultDate?.startDate) as TDate,
          )
        : "default",
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

    const parseDateValue = (
      dateValue: string | null | undefined,
      field: DateParserField,
    ): ParserResult<TDate> | undefined =>
      parseProp
        ? parseProp(dateValue ?? "", field, format)
        : dateAdapter.parse.bind(dateAdapter)(dateValue ?? "", format);

    const [dateValue, setDateValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "DateInputRange",
      state: "dateValue",
    });

    const [date, setDate] = useControlled({
      controlled: dateProp,
      // biome-ignore lint/correctness/useExhaustiveDependencies: just on mount
      default: useMemo(() => {
        if (defaultDate) {
          return defaultDate;
        }
        if (!defaultValue) {
          return undefined;
        }
        const { date: startDate = undefined } =
          parseDateValue(defaultValue?.startDate, DateParserField.START) ?? {};
        const { date: endDate = undefined } =
          parseDateValue(defaultValue?.endDate, DateParserField.END) ?? {};
        return {
          startDate,
          endDate,
        };
      }, []),
      name: "DateInputRange",
      state: "date",
    });

    const lastAppliedValue = useRef<DateInputRangeValue>(dateValue);
    const preservedTime = useRef<{
      startTime: TimeFields | null;
      endTime: TimeFields | null;
    }>({ startTime: null, endTime: null });
    preservedTime.current = {
      startTime:
        date?.startDate && dateAdapter.isValid(date?.startDate)
          ? dateAdapter.getTime(date.startDate)
          : null,
      endTime:
        date?.endDate && dateAdapter.isValid(date?.endDate)
          ? dateAdapter.getTime(date.endDate)
          : null,
    };
    const setDateValueFromDate = (newDate: typeof date) => {
      let newDateValue = { startDate: "", endDate: "" };
      if (!newDate?.startDate) {
        newDateValue = { ...newDateValue, startDate: "" };
      } else if (!dateAdapter.isValid(newDate?.startDate)) {
        newDateValue = {
          ...newDateValue,
          startDate: dateValue?.startDate ?? "",
        };
      } else if (newDate?.startDate) {
        const formattedStartDateValue = dateAdapter.format(
          newDate.startDate,
          format,
        );
        newDateValue = { ...newDateValue, startDate: formattedStartDateValue };
      }
      if (!newDate?.endDate) {
        newDateValue = { ...newDateValue, endDate: "" };
      } else if (!dateAdapter.isValid(newDate?.endDate)) {
        newDateValue = { ...newDateValue, endDate: dateValue?.endDate ?? "" };
      } else if (newDate?.endDate && dateAdapter.isValid(newDate.endDate)) {
        const formattedEndDateValue = dateAdapter.format(
          newDate.endDate,
          format,
        );
        newDateValue = { ...newDateValue, endDate: formattedEndDateValue };
      }

      if (
        (!newDateValue?.startDate && !!dateValue?.startDate) ||
        (!newDateValue.endDate && !!dateValue?.endDate) ||
        newDateValue?.startDate !== dateValue?.startDate ||
        newDateValue?.endDate !== dateValue?.endDate
      ) {
        onDateValueChange?.(null, newDateValue);
        setDateValue(newDateValue);
      }
      return newDateValue;
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: Update date string value ONLY when selected date changes, not when date string itself change
    useEffect(() => {
      lastAppliedValue.current = setDateValueFromDate(date);
    }, [date, date?.startDate, date?.endDate, dateAdapter.format, format]);

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
      const { date: startDate = undefined, ...startDateParseDetails } =
        parseDateValue(dateValue?.startDate, DateParserField.START) ?? {};
      const { date: endDate = undefined, ...endDateParseDetails } =
        parseDateValue(dateValue?.endDate, DateParserField.END) ?? {};

      const updatedDateRange: DateRangeSelection<TDate> = {
        startDate: dateValue?.startDate?.length ? startDate : null,
        endDate: dateValue?.endDate?.length ? endDate : null,
      };
      if (dateAdapter.isValid(startDate)) {
        updatedDateRange.startDate = dateAdapter.setTimezone(
          startDate,
          timezone,
        );
        if (preservedTime.current.startTime) {
          updatedDateRange.startDate = dateAdapter.set(
            updatedDateRange.startDate,
            preservedTime.current.startTime,
          );
        }
      }
      if (dateAdapter.isValid(endDate)) {
        updatedDateRange.endDate = dateAdapter.setTimezone(endDate, timezone);
        if (preservedTime.current.endTime) {
          updatedDateRange.endDate = dateAdapter.set(
            updatedDateRange.endDate,
            preservedTime.current.endTime,
          );
        }
      }
      const updatedDateValue = setDateValueFromDate(updatedDateRange);

      setDate(updatedDateRange);

      if (
        lastAppliedValue.current.startDate !== updatedDateValue.startDate ||
        lastAppliedValue.current.endDate !== updatedDateValue.endDate
      ) {
        onDateChange?.(event, updatedDateRange, {
          startDate: startDateParseDetails,
          endDate: endDateParseDetails,
        });
        onDateValueChange?.(event, updatedDateValue);
        lastAppliedValue.current = updatedDateValue;
      }
    };

    const handleStartInputChange: ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const newDateValue = { ...dateValue, startDate: event.target.value };
      setDateValue(newDateValue);
      startInputPropsOnChange?.(event);
      onChange?.(event);
      onDateValueChange?.(event, newDateValue);
    };

    const handleEndInputChange: ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const newDateValue = { ...dateValue, endDate: event.target.value };
      setDateValue(newDateValue);
      endInputPropsOnChange?.(event);
      onChange?.(event);
      onDateValueChange?.(event, newDateValue);
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
          aria-describedby={
            clsx(formFieldDescribedBy, startInputPropsDescribedBy) || undefined
          }
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
          value={
            isReadOnly && !dateValue?.startDate
              ? emptyReadOnlyMarker
              : (dateValue.startDate ?? dateAdapter.format(undefined, format))
          }
          {...restStartInputProps}
          onBlur={handleStartInputBlur}
          onChange={handleStartInputChange}
          onKeyDown={handleStartInputKeyDown}
          onFocus={!isDisabled ? handleStartInputFocus : undefined}
          required={startInputIsRequired}
        />
        <span className={withBaseName("dash")}>-</span>
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
          value={
            isReadOnly && !dateValue?.endDate
              ? emptyReadOnlyMarker
              : (dateValue.endDate ?? dateAdapter.format(undefined, format))
          }
          {...restEndInputProps}
          onBlur={handleEndInputBlur}
          onChange={handleEndInputChange}
          onKeyDown={handleEndInputKeyDown}
          onFocus={!isDisabled ? handleEndInputFocus : undefined}
          required={endInputIsRequired}
        />
        <div className={withBaseName("endAdornmentContainer")}>
          {!isDisabled && validationStatus && (
            <StatusAdornment status={validationStatus} />
          )}
          {endAdornment}
        </div>
        <div className={withBaseName("activationIndicator")} />
      </div>
    );
  },
);

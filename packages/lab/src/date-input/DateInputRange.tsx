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
import type { DateRangeSelection } from "../calendar";
import {
  type DateDetail,
  type DateFrameworkType,
  type TimeFields,
  useLocalization,
} from "../date-adapters";
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
export type DateInputRangeDetails<TDate extends DateFrameworkType> = {
  /** Details of parsing the start date and applying any validation */
  startDate: DateDetail<TDate>;
  /** Details of parsing the end date and applying any validation */
  endDate: DateDetail<TDate>;
};

/**
 * Props for the DateInputRange component.
 * @template T
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
   * Locale for date formatting
   */
  locale?: any;
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
    date: DateRangeSelection<TDate>,
    details: DateInputRangeDetails<TDate>,
  ) => void;
  /**
   * Called when input values change, either due to user interaction or programmatic formatting of valid dates.
   * @param newValue - The new date input range value.
   */
  onDateValueChange?: (newValue: DateInputRangeValue) => void;
}

export const DateInputRange = forwardRef<
  HTMLDivElement,
  DateInputRangeProps<any>
>(
  <TDate extends DateFrameworkType>(
    props: DateInputRangeProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
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
      format = "DD MMM YYYY",
      startInputProps = {},
      endInputProps = {},
      startInputRef: startInputRefProp,
      endInputRef: endInputRefProp,
      locale,
      placeholder = "dd mmm yyyy",
      readOnly: readOnlyProp,
      validationStatus: validationStatusProp,
      variant = "primary",
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

    const { dateAdapter } = useLocalization<TDate>();

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
    const preservedTime = useRef<{
      startTime: TimeFields | null;
      endTime: TimeFields | null;
    }>({ startTime: null, endTime: null });
    preservedTime.current = {
      startTime: date?.startDate ? dateAdapter.getTime(date.startDate) : null,
      endTime: date?.endDate ? dateAdapter.getTime(date.endDate) : null,
    };

    const setDateValueFromDate = (newDate: typeof date) => {
      let newDateValue = { ...dateValue };

      if (newDate?.startDate && dateAdapter.isValid(newDate.startDate)) {
        const formattedStartDateValue = dateAdapter.format(
          newDate?.startDate,
          format,
          locale,
        );
        newDateValue = { ...dateValue, startDate: formattedStartDateValue };
      }
      if (newDate?.endDate && dateAdapter.isValid(newDate.endDate)) {
        const formattedEndDateValue = dateAdapter.format(
          newDate?.endDate,
          format,
          locale,
        );
        newDateValue = { ...newDateValue, endDate: formattedEndDateValue };
      }

      if (
        newDateValue?.startDate !== dateValue?.startDate ||
        newDateValue?.endDate !== dateValue?.endDate
      ) {
        onDateValueChange?.(newDateValue);
        setDateValue(newDateValue);
      }
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
      const startDateParseDetails = dateValue?.startDate?.length
        ? dateAdapter.parse(dateValue.startDate, format, locale)
        : undefined;
      const endDateParseDetails = dateValue?.endDate?.length
        ? dateAdapter.parse(dateValue.endDate, format, locale)
        : undefined;
      const updatedDateRange = {
        startDate: startDateParseDetails?.date,
        endDate: endDateParseDetails?.date,
      };
      setDateValueFromDate(updatedDateRange);
      setDate(updatedDateRange);

      if (
        lastAppliedValue.current.startDate !== dateValue.startDate ||
        lastAppliedValue.current.endDate !== dateValue.endDate
      ) {
        if (updatedDateRange.startDate && preservedTime.current.startTime) {
          updatedDateRange.startDate = dateAdapter.set(
            updatedDateRange.startDate,
            preservedTime.current.startTime,
          );
        }
        if (updatedDateRange?.endDate && preservedTime.current.endTime) {
          updatedDateRange.endDate = dateAdapter.set(
            updatedDateRange.endDate,
            preservedTime.current.endTime,
          );
        }
        const updatedDetails = {
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
      onDateValueChange?.(newDateValue);
    };

    const handleEndInputChange: ChangeEventHandler<HTMLInputElement> = (
      event,
    ) => {
      const newDateValue = { ...dateValue, endDate: event.target.value };
      setDateValue(newDateValue);
      endInputPropsOnChange?.(event);
      onChange?.(event, newDateValue);
      onDateValueChange?.(newDateValue);
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

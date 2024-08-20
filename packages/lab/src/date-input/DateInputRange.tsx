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
  useCallback,
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
import { createCalendarDate } from "./utils";

const withBaseName = makePrefixer("saltDateInput");

export type DateInputRangeValue = {
  startDate?: string | undefined;
  endDate?: string | undefined;
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
  onDateChange?: (event: SyntheticEvent, date: T | null) => void;
  /**
   * Called when input values changes, either due to user-interaction or programmatic formatting of valid dates
   */
  onDateValueChange?: (
    newValue: DateInputRangeValue,
    isFormatted: boolean,
  ) => void;
  /**
   * Name of input that should receive focus
   */
  focusedInput?: "start" | "end" | null;
  /**
   * @param inputDate - parse date string to valid `DateValue` or undefined, if invalid
   */
  parse?: (inputDate: string | undefined) => DateValue | undefined;
  locale?: string;
  timeZone?: string;
}

export const DateInputRange = forwardRef<HTMLDivElement, DateInputRangeProps>(
  function DateInput(props, ref) {
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
      focusedInput = null,
      formatDate = defaultFormatDate,
      startInputProps = {},
      endInputProps = {},
      startInputRef: startInputRefProp,
      endInputRef: endInputRefProp,
      parse = createCalendarDate,
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

    const setDateValueFromDate = useCallback(
      (newDate: DateInputRangeProps["date"]) => {
        let newDateValue = { ...dateValue };
        const formattedStartDate = formatDate(newDate?.startDate, locale, {
          timeZone,
        });
        if (formattedStartDate) {
          newDateValue = { ...newDateValue, startDate: formattedStartDate };
        }
        const formattedEndDate = formatDate(newDate?.endDate, locale, {
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
      },
      [dateValue, formatDate, locale, onDateValueChange, timeZone],
    );

    // Update date string value when selected date changes
    useEffect(() => {
      setDateValueFromDate(date);
    }, [date, date?.startDate, date?.endDate, setDateValueFromDate]);

    useEffect(() => {
      if (focusedInput === "start" && startInputRef.current) {
        const input = startInputRef.current;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      } else if (focusedInput === "end" && endInputRef.current) {
        const input = endInputRef.current;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, [focusedInput]);

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
      const newStartDate = parse(dateValue.startDate);
      const newEndDate = parse(dateValue.endDate);

      const hasDateChanged = (
        newDate: DateValue | null | undefined,
        oldDate: DateValue | null | undefined,
      ): boolean => {
        if (newDate && oldDate) {
          return newDate.compare(oldDate) !== 0;
        }
        return newDate !== oldDate;
      };

      const createNewDateRange = (
        startDate: DateValue | null | undefined,
        endDate: DateValue | null | undefined,
      ): DateRangeSelection | null => {
        if (!startDate && !endDate) {
          return null;
        }

        const dateRange: DateRangeSelection = {};
        if (startDate) {
          dateRange.startDate = startDate;
        }
        if (endDate) {
          dateRange.endDate = endDate;
        }

        return dateRange;
      };

      const hasStartDateChanged = hasDateChanged(newStartDate, date?.startDate);
      const hasEndDateChanged = hasDateChanged(newEndDate, date?.endDate);

      const newDate: DateRangeSelection | null = createNewDateRange(
        newStartDate,
        newEndDate,
      );

      if (newDate?.startDate || newDate?.endDate) {
        setDateValueFromDate(newDate);
      }

      if (hasStartDateChanged || hasEndDateChanged) {
        setDate(newDate);
        onDateChange?.(event, newDate);
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

import { clsx } from "clsx";
import {
  ChangeEvent,
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  FocusEventHandler,
  forwardRef,
  InputHTMLAttributes,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  Ref,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {CalendarDate, DateValue} from "@internationalized/date";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  InputProps,
  makePrefixer,
  StatusAdornment,
  useControlled,
  useForkRef,
  useFormFieldProps,
  useId,
} from "@salt-ds/core";
import { RangeSelectionValueType } from "../calendar";
import { createCalendarDate, formatDate as defaultFormatDate } from "./utils";
import dateInputCss from "./DateInput.css";

const withBaseName = makePrefixer("saltDateInput");

export type DateInputRangeValue = {
  startDate?: string | undefined;
  endDate?: string | undefined;
};

export interface DateInputRangeProps<
  SelectionVariantType = RangeSelectionValueType
> extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange">,
    Omit<InputProps, "defaultValue" | "inputRef" | "value" | "onChange"> {
  ariaLabel?: string;
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
  formatDate?: (input: DateValue | null | undefined) => string;
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
  date?: SelectionVariantType | null;
  /**
   * The initial selected date value. Use when the component is un-controlled.
   */
  defaultDate?: SelectionVariantType | null;
  /**
   * Callback fired when the selected date change.
   */
  onDateChange?: (
    event: SyntheticEvent,
    date: SelectionVariantType | null
  ) => void;
  /**
   * Callback fired when the input value change.
   */
  onChange?: (
    event: ChangeEvent<HTMLInputElement>,
    date: DateInputRangeValue
  ) => void;
  /**
   * Name of input that should receive focus
   */
  focusedInput?: "start" | "end" | null;
  /**
   * @param inputDate - parse date string to valid `CalendarDate` or undefined, if invalid
   */
  parse?: (inputDate: string | undefined) => CalendarDate | undefined;
}

export const DateInputRange = forwardRef<HTMLDivElement, DateInputRangeProps>(
  function DateInput(props, ref) {
    const {
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
      name: "DateInput",
      state: "date",
    });
    const [dateValue, setDateValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "DateInput",
      state: "dateValue",
    });

    const setDateValueFromDate = (newDate:DateInputRangeProps["date"]) => {
      const formattedStartDate = newDate?.startDate ? formatDate(newDate.startDate) : "";
      const formattedEndDate = newDate?.endDate ? formatDate(newDate.endDate) : "";
      setDateValue({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
    }

    // Update date string value when selected date changes
    useEffect(() => {
      setDateValueFromDate(date);
    }, [date?.startDate, date?.endDate, formatDate]);

    useEffect(() => {
      if (focusedInput === "start") {
        startInputRef?.current?.focus();
      } else if (focusedInput === "end") {
        endInputRef?.current?.focus();
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
      // date ranges reset, when the end date is no longer defined
      const newEndDate = parse(dateValue.endDate);
      const hasStartDateChanged =
        newStartDate && date?.startDate
          ? newStartDate.compare(date.startDate) !== 0
          : newStartDate !== date?.startDate;
      const hasEndDateChanged =
        newEndDate && date?.endDate
          ? newEndDate.compare(date.endDate) !== 0
          : newEndDate !== date?.endDate;
      if (hasStartDateChanged || hasEndDateChanged) {
        const newDate = {
          ...(!!newStartDate && { startDate: newStartDate }),
          ...(!!newEndDate && { endDate: newEndDate }),
        };
        setDateValueFromDate(newDate);
        setDate(newDate);
        onDateChange?.(event, newDate);
      }
    };

    const handleStartInputChange: ChangeEventHandler<HTMLInputElement> = (
      event
    ) => {
      const newDateValue = { ...dateValue, startDate: event.target.value };
      setDateValue(newDateValue);
      startInputPropsOnChange?.(event);
      onChange?.(event, newDateValue);
    };

    const handleEndInputChange: ChangeEventHandler<HTMLInputElement> = (
      event
    ) => {
      const newDateValue = { ...dateValue, endDate: event.target.value };
      setDateValue(newDateValue);
      endInputPropsOnChange?.(event);
      onChange?.(event, newDateValue);
    };

    const handleStartInputFocus: FocusEventHandler<HTMLInputElement> = (
      event
    ) => {
      setFocused(true);
      startInputPropsOnFocus?.(event);
    };

    const handleEndInputFocus: FocusEventHandler<HTMLInputElement> = (
      event
    ) => {
      setFocused(true);
      endInputPropsOnFocus?.(event);
    };

    const handleStartInputBlur: FocusEventHandler<HTMLInputElement> = (
      event
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
      event
    ) => {
      if (event.key === "Enter") {
        apply(event);
      }
      startInputPropsOnKeyDown?.(event);
    };

    const handleEndInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
      event
    ) => {
      if (event.key === "Enter") {
        apply(event);
      }
      endInputPropsOnKeyDown?.(event);
    };

    const handleWrapperClick: MouseEventHandler<HTMLDivElement> = (event) => {
      if (event.target === wrapperRef.current) {
        startInputRef?.current?.focus();
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
          },
          className
        )}
        ref={handleWrapperRef}
        onClick={handleWrapperClick}
        {...rest}
      >
        <input
          autoComplete="off"
          aria-describedby={clsx(
            formFieldDescribedBy,
            startInputPropsDescribedBy
          )}
          aria-labelledby={clsx(
            formFieldLabelledBy,
            startInputPropsLabelledBy,
            startInputID
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
              : dateValue.startDate ?? ''
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
            endInputPropsDescribedBy
          )}
          aria-labelledby={clsx(
            formFieldLabelledBy,
            endInputPropsLabelledBy,
            endInputID
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
              : dateValue.endDate ?? ''
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
  }
);

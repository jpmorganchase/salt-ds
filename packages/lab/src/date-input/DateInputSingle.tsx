import {
  type DateValue,
  type TimeFields,
  getLocalTimeZone,
} from "@internationalized/date";
import {
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
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type SingleDateSelection,
  formatDate as defaultFormatDate,
  getCurrentLocale,
} from "../calendar";
import dateInputCss from "./DateInput.css";
import {
  type DateInputParserDetails,
  extractTimeFieldsFromDate,
  parseCalendarDate,
} from "./utils";

const withBaseName = makePrefixer("saltDateInput");

/**
 * Details of parsing the date
 */
export type DateInputSingleDetails<T = DateValue> = DateInputParserDetails<T>;

/**
 * Props for the DateInputSingle component.
 * @template T
 */
export interface DateInputSingleProps<T = SingleDateSelection>
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
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
   * Attributes applied to the `input` element.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes
   */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
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
  format?: (date: DateValue | null | undefined) => string;
  /**
   * Reference for the input.
   */
  inputRef?: RefObject<HTMLInputElement>;
  /**
   * Input value. Use when the input value is controlled.
   */
  value?: string;
  /**
   * The initial input value. Use when the component is uncontrolled.
   */
  defaultValue?: string;
  /**
   * The date value. Use when the component is controlled.
   */
  date?: T | null;
  /**
   * The initial selected date value. Use when the component is uncontrolled.
   */
  defaultDate?: T | null;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param date - the selected date, null if in not a valid date or undefined if not defined
   * @param details - The details of date selection, either a valid date or error
   */
  onDateChange?: (
    event: SyntheticEvent,
    date: SingleDateSelection | null | undefined,
    details: DateInputSingleDetails<T>
  ) => void;
  /**
   * Function to parse date string to valid `DateValue` or null, if invalid or empty.
   * @param inputDate - The input date string.
   * @param locale - the locale for the parsed date
   * @returns The details of parsing the date.
   */
  parse?: (
    inputDate: string,
    locale: string,
  ) => DateInputSingleDetails<T>;
  /**
   * Called when input value changes, either due to user interaction or programmatic formatting of valid dates.
   * @param newValue - The new date input value.
   * @param isFormatted - Whether the value is formatted.
   */
  onDateValueChange?: (newValue: string, isFormatted: boolean) => void;
  /**
   * Locale of the entered date.
   */
  locale?: string;
  /**
   * Timezone of the entered date.
   */
  timeZone?: string;
}
export const DateInputSingle = forwardRef<HTMLDivElement, DateInputSingleProps>(
  function DateInput(props, ref) {
    const {
      bordered = false,
      className,
      disabled,
      "aria-label": ariaLabel,
      date: dateProp,
      defaultDate,
      onDateChange,
      value: valueProp,
      defaultValue = "",
      onChange,
      onClick,
      emptyReadOnlyMarker = "—",
      endAdornment,
      format: formatProp,
      inputProps = {},
      inputRef: inputRefProp = null,
      parse = parseCalendarDate,
      placeholder = "dd mmm yyyy",
      readOnly: readOnlyProp,
      validationStatus: validationStatusProp,
      variant = "primary",
      onDateValueChange,
      locale = getCurrentLocale(),
      timeZone = getLocalTimeZone(),
      ...rest
    } = props;
    const wrapperRef = useRef(null);
    const handleWrapperRef = useForkRef<HTMLDivElement>(ref, wrapperRef);
    const innerInputRef = useRef<HTMLInputElement>(null);
    const handleInputRef = useForkRef<HTMLInputElement>(
      innerInputRef,
      inputRefProp,
    );

    const inputId = useId();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-input-single",
      css: dateInputCss,
      window: targetWindow,
    });

    const [date, setDate] = useControlled({
      controlled: dateProp,
      default: defaultDate,
      name: "DateInputSingle",
      state: "date",
    });
    const [dateValue, setDateValue] = useControlled({
      controlled: valueProp,
      default: defaultValue,
      name: "DateInputSingle",
      state: "dateValue",
    });
    const lastAppliedValue = useRef<string>(dateValue);
    const preservedTime = useRef<TimeFields | undefined>(
      extractTimeFieldsFromDate(date || null),
    );

    const format = useCallback(
      (date: DateValue | null | undefined) => {
        return formatProp
          ? formatProp(date)
          : defaultFormatDate(date, locale, { timeZone });
      },
      [formatProp, locale, timeZone],
    );

    // Update date string value when selected date changes
    useEffect(() => {
      const formattedDate = format(date);
      if (formattedDate) {
        setDateValue(formattedDate);
        onDateValueChange?.(formattedDate, true);
      }
    }, [date, format]);

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
      "aria-describedby": dateInputDescribedBy,
      "aria-labelledby": dateInputLabelledBy,
      onBlur: inputPropsOnBlur,
      onChange: inputPropsOnChange,
      onKeyDown: inputPropsOnKeyDown,
      onFocus: inputPropsOnFocus,
      required: dateInputPropsRequired,
      ...restDateInputProps
    } = inputProps;

    const isRequired = formFieldRequired
      ? ["required", "asterisk"].includes(formFieldRequired)
      : dateInputPropsRequired;

    const apply = (event: SyntheticEvent) => {
      const details = parse(dateValue ?? "", locale);
      const { date: parsedDate } = details;
      const formattedDate = format(parsedDate);
      if (formattedDate) {
        setDateValue(formattedDate);
        onDateValueChange?.(formattedDate, true);
      }
      setDate(parsedDate);
      const hasDateChanged =
        parsedDate && date ? parsedDate.compare(date) !== 0 : false;
      let updatedDate = parsedDate;
      if (parsedDate && hasDateChanged && preservedTime.current) {
        updatedDate = parsedDate.set(preservedTime.current);
      }
      if (lastAppliedValue.current !== dateValue) {
        const updatedDetails = { ...details, date: updatedDate };
        onDateChange?.(event, updatedDate, updatedDetails);
      }
      lastAppliedValue.current = dateValue;
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newDateValue = event.target.value;
      setDateValue(newDateValue);
      inputPropsOnChange?.(event);
      onChange?.(event);
      onDateValueChange?.(newDateValue, false);
    };

    const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
      setFocused(true);
      inputPropsOnFocus?.(event);
    };
    const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      setFocused(false);
      apply(event);
      inputPropsOnBlur?.(event);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (event.key === "Enter") {
        apply(event);
      }
      inputPropsOnKeyDown?.(event);
    };

    const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
      if (event.target === wrapperRef.current) {
        innerInputRef?.current?.focus();
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
        onClick={handleClick}
        {...rest}
      >
        <input
          autoComplete="off"
          aria-describedby={clsx(formFieldDescribedBy, dateInputDescribedBy)}
          aria-labelledby={clsx(
            formFieldLabelledBy,
            dateInputLabelledBy,
            inputId,
          )}
          aria-label={clsx("Selected date", ariaLabel)}
          id={inputId}
          className={withBaseName("input")}
          disabled={isDisabled}
          readOnly={isReadOnly}
          ref={handleInputRef}
          tabIndex={isDisabled ? -1 : 0}
          placeholder={placeholder}
          size={placeholder.length}
          value={isReadOnly && !dateValue ? emptyReadOnlyMarker : dateValue}
          {...restDateInputProps}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={!isDisabled ? handleFocus : undefined}
          required={isRequired}
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

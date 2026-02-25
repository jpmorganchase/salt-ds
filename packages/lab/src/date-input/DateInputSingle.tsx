import {
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
import type { SingleDateSelection } from "../calendar";
import { useLocalization } from "../localization-provider";
import dateInputCss from "./DateInput.css";

const withBaseName = makePrefixer("saltDateInput");

/**
 * Details of parsing the date
 */
export type DateInputSingleDetails = DateDetail;

/**
 * Props for the DateInputSingle component.
 * @template TDate - The type of the date object.
 */
export interface DateInputSingleProps<TDate extends DateFrameworkType>
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
   * Start adornment component
   */
  startAdornment?: ReactNode;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Styling variant. Defaults to "primary".
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Format string for date.
   */
  format?: string;
  /**
   * Reference for the input.
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Parser callback, if not using the adapter's parser
   * @param value - date string to parse
   * @param format - format required
   */
  parse?: (value: string, format: string) => ParserResult<TDate>;
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
  date?: TDate | null;
  /**
   * The initial selected date value. Use when the component is uncontrolled.
   */
  defaultDate?: TDate | null;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param date - the selected date, invalid date if not a valid date or undefined (uncontrolled) or null (controlled) if not defined
   * @param details - The details of date selection, either a valid date or error
   */
  onDateChange?: (
    event: SyntheticEvent,
    date: SingleDateSelection<TDate> | null | undefined,
    details: DateInputSingleDetails,
  ) => void;
  /**
   * Called when input value changes, either due to user interaction or programmatic formatting of valid dates.
   * @param event - The synthetic event or null if a programmatic change.
   * @param newValue - The new date input value.
   */
  onDateValueChange?: (event: SyntheticEvent | null, newValue: string) => void;
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

export const DateInputSingle = forwardRef<
  HTMLDivElement,
  DateInputSingleProps<DateFrameworkType>
>(
  <TDate extends DateFrameworkType>(
    props: DateInputSingleProps<TDate>,
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
      defaultValue = "",
      onChange,
      onClick,
      emptyReadOnlyMarker = "—",
      endAdornment,
      inputProps = {},
      inputRef: inputRefProp = null,
      parse: parseProp,
      placeholder = format.toLowerCase(),
      readOnly: readOnlyProp,
      startAdornment,
      validationStatus: validationStatusProp,
      variant = "primary",
      onDateValueChange,
      timezone = dateProp || defaultDate
        ? dateAdapter.getTimezone((dateProp ?? defaultDate) as TDate)
        : "default",
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
      // biome-ignore lint/correctness/useExhaustiveDependencies: just on mount
      default: useMemo(() => {
        if (defaultDate) {
          return defaultDate;
        }
        if (!defaultValue) {
          return undefined;
        }
        return dateAdapter.parse(defaultValue, format) as TDate;
      }, []),
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
    const preservedTime = useRef<TimeFields | null>(null);
    preservedTime.current = dateAdapter.isValid(date)
      ? dateAdapter.getTime(date)
      : null;

    // biome-ignore lint/correctness/useExhaustiveDependencies: Update date string value ONLY when selected date changes, not when date string itself change
    useEffect(() => {
      const formattedValue = dateAdapter.format(date, format);
      const hasValueChanged = formattedValue !== dateValue;
      if (
        // should not reset "error" input values
        (date === null || dateAdapter.isValid(date)) &&
        hasValueChanged
      ) {
        setDateValue(formattedValue);
        onDateValueChange?.(null, formattedValue);
        lastAppliedValue.current = formattedValue;
      }
    }, [date, dateAdapter.format, format]);

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
      const parse = parseProp ?? dateAdapter.parse.bind(dateAdapter);
      const parseResult = parse(dateValue ?? "", format);
      let parsedDate: TDate | null;
      let parseDetails: DateDetail;
      ({ date: parsedDate, ...parseDetails } = parseResult);
      parsedDate = dateValue ? parsedDate : null;
      let formattedValue = "";
      const isDateValid = dateAdapter.isValid(parsedDate);
      if (isDateValid && parsedDate) {
        parsedDate = dateAdapter.setTimezone(parsedDate, timezone);
        if (preservedTime.current) {
          parsedDate = dateAdapter.set(parsedDate, preservedTime.current);
        }
        formattedValue = dateAdapter.format(parsedDate, format);
      }
      const hasValueChanged = formattedValue !== dateValue;
      const newValue = isDateValid ? formattedValue : dateValue;
      if (hasValueChanged) {
        setDateValue(newValue);
        onDateValueChange?.(event, newValue);
      }

      setDate(parsedDate);

      if (lastAppliedValue.current !== newValue) {
        onDateChange?.(event, parsedDate, parseDetails);
      }
      lastAppliedValue.current = newValue;
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newDateValue = event.target.value;
      setDateValue(newDateValue);
      inputPropsOnChange?.(event);
      onChange?.(event);
      onDateValueChange?.(event, newDateValue);
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
        {startAdornment && (
          <div className={withBaseName("startAdornmentContainer")}>
            {startAdornment}
          </div>
        )}
        <input
          autoComplete="off"
          aria-describedby={
            clsx(formFieldDescribedBy, dateInputDescribedBy) || undefined
          }
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
          value={isReadOnly && !dateValue ? emptyReadOnlyMarker : dateValue}
          {...restDateInputProps}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={!isDisabled ? handleFocus : undefined}
          required={isRequired}
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

import {
  StatusAdornment,
  makePrefixer,
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
} from "@salt-ds/date-adapters";
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
  type Ref,
  type SyntheticEvent,
  forwardRef,
  useEffect,
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
  variant?: "primary" | "secondary";
  /**
   * Format string for date.
   */
  format?: string;
  /**
   * Reference for the input.
   */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Locale for date formatting and parsing
   */
  // biome-ignore lint/suspicious/noExplicitAny: locale is date framework dependent
  locale?: any;
  /**
   * Parser callback, if not using the adapter's parser
   * @param value - date string to parse
   * @param format - format required
   * @param locale - locale required
   */
  // biome-ignore lint/suspicious/noExplicitAny: locale is date framework dependent
  parse?: (value: string, format: string, locale?: any) => ParserResult<TDate>;
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
      locale,
      format = "DD MMM YYYY",
      defaultValue = dateAdapter.format(undefined, format, locale),
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
    const preservedTime = useRef<TimeFields | null>(null);
    preservedTime.current = dateAdapter.isValid(date)
      ? dateAdapter.getTime(date)
      : null;

    // biome-ignore lint/correctness/useExhaustiveDependencies: Update date string value ONLY when selected date changes, not when date string itself change
    useEffect(() => {
      const formattedValue = dateAdapter.format(date, format, locale);
      const hasValueChanged = formattedValue !== dateValue;
      if (
        // don't want to reset "error" input values
        (dateAdapter.isValid(date) || date === null) &&
        hasValueChanged
      ) {
        setDateValue(formattedValue);
        onDateValueChange?.(null, formattedValue);
      }
    }, [date, dateAdapter.format, format, locale]);

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
      const parseResult = parse(dateValue ?? "", format, locale);
      let { date: parsedDate, ...parseDetails } = parseResult;
      const formattedValue = dateAdapter.format(parsedDate, format, locale);
      const hasValueChanged = formattedValue !== dateValue;
      if (dateAdapter.isValid(parsedDate) && hasValueChanged) {
        setDateValue(formattedValue);
        onDateValueChange?.(event, formattedValue);
      }

      setDate(parsedDate);

      if (lastAppliedValue.current !== dateValue) {
        if (dateAdapter.isValid(parsedDate) && preservedTime.current) {
          parsedDate = dateAdapter.set(parsedDate, preservedTime.current);
        }
        onDateChange?.(event, parsedDate, parseDetails);
      }
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const newDateValue = event.target.value;
      setDateValue(newDateValue);
      inputPropsOnChange?.(event);
      onChange?.(event);
      onDateValueChange?.(event, newDateValue);
    };

    const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
      lastAppliedValue.current = dateValue;
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

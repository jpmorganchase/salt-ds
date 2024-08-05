import type { CalendarDate, DateValue } from "@internationalized/date";
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
  useEffect,
  useRef,
  useState,
} from "react";
import type { SingleDateSelection } from "../calendar";
import dateInputCss from "./DateInput.css";
import { createCalendarDate, formatDate as defaultFormatDate } from "./utils";

const withBaseName = makePrefixer("saltDateInput");

export interface DateInputSingleProps<T = SingleDateSelection>
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
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
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dateInput#Attributes) applied to the `input` element.
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
  formatDate?: (input: DateValue | null | undefined) => string | undefined;
  /**
   * Reference for the input;
   */
  inputRef?: RefObject<HTMLInputElement>;
  /**
   * Input value.
   * Use when the input value is controlled.
   */
  value?: string;
  /**
   * The initial input value. Use when the component is un-controlled.
   */
  defaultValue?: string;
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
  onDateChange?: (event: SyntheticEvent, date: T | null) => void;
  /**
   * If `true`, the component should receive focus.
   */
  focusedInput?: boolean;
  /**
   * @param inputDate - parse date string to valid `CalendarDate` or undefined, if invalid
   */
  parse?: (inputDate: string | undefined) => CalendarDate | undefined;
  /**
   * Called when input value changes, either due to user-interaction or programmatic formatting of valid dates
   */
  onDateValueChange?: (newValue: string, isFormatted: boolean) => void;
}

export const DateInputSingle = forwardRef<HTMLDivElement, DateInputSingleProps>(
  function DateInput(props, ref) {
    const {
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
      focusedInput = false,
      formatDate = defaultFormatDate,
      inputProps = {},
      inputRef: inputRefProp = null,
      parse = createCalendarDate,
      placeholder = "dd mmm yyyy",
      readOnly: readOnlyProp,
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
      testId: "salt-date-input",
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

    // Update date string value when selected date changes
    useEffect(() => {
      const formattedDate = formatDate(date);
      if (formattedDate) {
        setDateValue(formattedDate);
        onDateValueChange?.(formattedDate, true);
      }
    }, [date, formatDate]);

    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (focusedInput) {
        innerInputRef?.current?.focus();
      }
    }, [focusedInput]);

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
      const newDate = parse(dateValue) || null;
      if (newDate) {
        const formattedDate = formatDate(newDate);
        if (formattedDate) {
          setDateValue(formattedDate);
          onDateValueChange?.(formattedDate, true);
        }
      }
      const hasDateChanged =
        newDate && date ? newDate.compare(date) !== 0 : newDate !== date;
      if (hasDateChanged) {
        setDate(newDate);
        onDateChange?.(event, newDate);
      }
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
          aria-label={clsx("Start date", ariaLabel)}
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

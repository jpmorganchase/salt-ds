import {
  Button,
  makePrefixer,
  useControlled,
  useForkRef,
  useIcon,
} from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type KeyboardEvent,
  type KeyboardEventHandler,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  DateInputErrorEnum,
  DateInputRange,
  type DateInputRangeProps,
  type DateInputParserDetails,
  type DateInputRangeValue,
} from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";
import type { DateValue } from "@internationalized/date";
import type { DateRangeSelection } from "../calendar";

const withBaseName = makePrefixer("saltDatePickerRangeInput");

/**
 * Details of parsing the date range
 */
export type DateInputRangeDetails<V = DateValue> = {
  /** Details of parsing the start date and applying any validation */
  startDate: DateInputParserDetails<V>;
  /** Details of parsing the end date and applying any validation */
  endDate: DateInputParserDetails<V>;
};

/**
 * Props for the DatePickerRangeInput component.
 */
export interface DatePickerRangeInputProps<T = DateValue>
  extends DateInputRangeProps {
  /**
   * Function to validate the entered date
   * @param details - The details of date selection, either a valid date or error
   * @returns updated DateInputRangeDetails details
   */
  validate?: (range: DateInputRangeDetails<T>) => DateInputRangeDetails<T>;
}

export function defaultRangeValidator(
  details: DateInputRangeDetails,
  minDate: DateValue | undefined,
  maxDate: DateValue | undefined,
): DateInputRangeDetails {
  const startDate = details.startDate.date;
  const endDate = details.endDate.date;

  // If endDate but no startDate defined
  if (startDate === undefined && endDate) {
    details.startDate.errors?.push({
      type: DateInputErrorEnum.UNSET,
      message: "no start date defined",
    });
  }
  // If startDate is after endDate
  if (startDate && endDate && startDate.compare(endDate) > 0) {
    details.startDate.errors?.push({
      type: "greater-than-end-date",
      message: "start date after end date",
    });
  }
  // startDate is not before minDate
  if (minDate && startDate && startDate.compare(minDate) < 0) {
    details.startDate.errors?.push({
      type: "min-date",
      message: "is before min date",
    });
  }
  // endDate is not after maxDate
  if (maxDate && endDate && endDate.compare(maxDate) > 0) {
    details.startDate.errors?.push({
      type: "max-date",
      message: "is after max date",
    });
  }
  return details;
}

export const DatePickerRangeInput = forwardRef<
  HTMLDivElement,
  DatePickerRangeInputProps
>(function DatePickerRangeInput(props, ref) {
  const {
    className,
    endInputProps: endInputPropsProp,
    startInputProps: startInputPropsProp,
    onKeyDown,
    defaultValue,
    value: valueProp,
    validate,
    onChange,
    onDateValueChange,
    ...rest
  } = props;

  const { CalendarIcon } = useIcon();

  const {
    state: { selectedDate, disabled, readOnly, cancelled, locale, timeZone, minDate, maxDate },
    helpers: { select },
  } = useDatePickerContext({ selectionVariant: "range" });
  const {
    state: { open, floatingUIResult },
    helpers: { getReferenceProps, setOpen },
  } = useDatePickerOverlay();

  const inputRef = useForkRef<HTMLDivElement>(ref, floatingUIResult?.reference);
  const previousValue = useRef<typeof valueProp>();

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "DatePickerRangeInput",
    state: "dateValue",
  });

  const handleCalendarButton = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const handleDateChange = useCallback(
    (
      _event: SyntheticEvent,
      _date: DateRangeSelection,
      details: DateInputRangeDetails,
    ) => {
      const validatedSelection = validate ? validate(details) : defaultRangeValidator(details, minDate, maxDate);
      select(validatedSelection);
    },
    [select, minDate, maxDate],
  );

  const handleDateValueChange = (
    newDateValue: DateInputRangeValue,
    isFormatted: boolean,
  ) => {
    setValue(newDateValue);
    onDateValueChange?.(newDateValue, isFormatted);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: should run when open changes and not selected date or value
  useEffect(() => {
    if (open) {
      previousValue.current = value;
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: avoid excessive re-rendering
  useEffect(() => {
    if (cancelled) {
      setValue(previousValue.current);
    }
  }, [cancelled]);

  const startInputProps: {
    onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  } = {
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        setOpen(true);
      }
      startInputPropsProp?.onKeyDown?.(event);
    },
    ...startInputPropsProp,
  };
  const endInputProps: {
    onKeyDown: KeyboardEventHandler<HTMLInputElement>;
  } = {
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        setOpen(true);
      }
      endInputPropsProp?.onKeyDown?.(event);
    },
    ...endInputPropsProp,
  };

  return (
    <DateInputRange
      value={value || { startDate: "", endDate: "" }}
      locale={locale}
      timeZone={timeZone}
      className={clsx(withBaseName(), className)}
      ref={inputRef}
      date={selectedDate || null}
      startInputProps={getReferenceProps(startInputProps)}
      endInputProps={getReferenceProps(endInputProps)}
      readOnly={readOnly}
      onDateChange={handleDateChange}
      onDateValueChange={handleDateValueChange}
      onChange={onChange}
      endAdornment={
        <Button
          appearance="transparent"
          sentiment="neutral"
          onClick={handleCalendarButton}
          disabled={disabled}
          aria-label="Open Calendar"
        >
          <CalendarIcon />
        </Button>
      }
      {...rest}
    />
  );
});

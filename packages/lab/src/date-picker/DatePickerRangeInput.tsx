import { Button, makePrefixer, useControlled, useIcon } from "@salt-ds/core";
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
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  DateDetailErrorEnum,
  type DateFrameworkType,
  type SaltDateAdapter,
  useLocalization,
} from "../date-adapters";
import {
  DateInputRange,
  type DateInputRangeDetails,
  type DateInputRangeProps,
  type DateInputRangeValue,
} from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerRangeInput");

/**
 * Props for the DatePickerRangeInput component.
 */
export interface DatePickerRangeInputProps<TDate extends DateFrameworkType>
  extends DateInputRangeProps<TDate> {
  /**
   * Function to validate the entered date
   * @param date - The selected date
   * @param details - The details of date selection, either a valid date or error
   * @returns updated DateInputRangeDetails details
   */
  validate?: (
    date: DateRangeSelection<TDate>,
    details: DateInputRangeDetails,
  ) => DateInputRangeDetails;
}

export function defaultRangeValidator<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  date: DateRangeSelection<TDate>,
  details: DateInputRangeDetails,
  minDate: TDate | undefined,
  maxDate: TDate | undefined,
): DateInputRangeDetails {
  const { startDate, endDate } = date;
  details.startDate = details.startDate || { errors: [] };
  details.endDate = details.endDate || { errors: [] };

  // If endDate but no startDate defined
  if (startDate === undefined && endDate) {
    details.startDate.errors = details.startDate.errors ?? [];
    details.startDate.errors?.push({
      type: DateDetailErrorEnum.UNSET,
      message: "no start date defined",
    });
  }
  // If startDate is after endDate
  if (
    dateAdapter.isValid(startDate) &&
    dateAdapter.isValid(endDate) &&
    dateAdapter.compare(startDate, endDate) > 0
  ) {
    details.startDate.errors = details.startDate.errors ?? [];
    details.startDate.errors?.push({
      type: "greater-than-end-date",
      message: "start date after end date",
    });
  }
  // If startDate is before minDate
  if (
    minDate &&
    dateAdapter.isValid(startDate) &&
    dateAdapter.compare(startDate, minDate) < 0
  ) {
    details.startDate.errors = details.startDate.errors ?? [];
    details.startDate.errors?.push({
      type: "min-date",
      message: "is before min date",
    });
  }
  // If endDate is after maxDate
  if (
    maxDate &&
    dateAdapter.isValid(endDate) &&
    dateAdapter.compare(endDate, maxDate) > 0
  ) {
    details.endDate.errors = details.endDate.errors ?? [];
    details.endDate.errors?.push({
      type: "max-date",
      message: "is after max date",
    });
  }
  return details;
}

export const DatePickerRangeInput = forwardRef(function DatePickerRangeInput<
  TDate extends DateFrameworkType,
>(
  props: DatePickerRangeInputProps<SingleDateSelection<TDate>>,
  ref: React.Ref<HTMLDivElement>,
) {
  const { dateAdapter } = useLocalization<TDate>();
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
    state: { selectedDate, disabled, readOnly, cancelled, minDate, maxDate },
    helpers: { select },
  } = useDatePickerContext<TDate>({ selectionVariant: "range" });
  const {
    state: { open },
    helpers: { setOpen },
  } = useDatePickerOverlay();

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
      event: SyntheticEvent,
      date: DateRangeSelection<TDate>,
      details: DateInputRangeDetails,
    ) => {
      const validatedDetails = validate
        ? validate(date, details)
        : defaultRangeValidator(dateAdapter, date, details, minDate, maxDate);
      select(event, date, validatedDetails);
    },
    [select, minDate, maxDate],
  );

  const handleDateValueChange = useCallback(
    (newDateValue: DateInputRangeValue) => {
      setValue(newDateValue);
      onDateValueChange?.(newDateValue);
    },
    [onDateValueChange],
  );

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
      className={clsx(withBaseName(), className)}
      date={selectedDate || null}
      startInputProps={startInputProps}
      endInputProps={endInputProps}
      readOnly={readOnly}
      ref={ref}
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

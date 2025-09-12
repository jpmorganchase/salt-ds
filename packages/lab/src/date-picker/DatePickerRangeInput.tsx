import { Button, makePrefixer, useControlled, useIcon } from "@salt-ds/core";
import {
  DateDetailError,
  type DateFrameworkType,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { clsx } from "clsx";
import {
  forwardRef,
  type MouseEventHandler,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  DateInputRange,
  type DateInputRangeDetails,
  type DateInputRangeProps,
  type DateInputRangeValue,
} from "../date-input";
import { useLocalization } from "../localization-provider";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerRangeInput");

/**
 * Props for the DatePickerRangeInput component.
 * @template TDate - The type of the date object.
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
    date: DateRangeSelection<TDate> | null,
    details: DateInputRangeDetails,
  ) => DateInputRangeDetails;
}

export function defaultRangeValidator<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  date: DateRangeSelection<TDate> | null,
  details: DateInputRangeDetails,
  minDate?: TDate,
  maxDate?: TDate,
): DateInputRangeDetails {
  const { startDate, endDate } = date || {};

  if (!startDate) {
    details.startDate = details.startDate || {};
    details.startDate.errors = details.startDate.errors || [];
    const unsetStartDateError = details.startDate.errors.find(
      (err) => err.type === DateDetailError.UNSET,
    );
    if (unsetStartDateError) {
      unsetStartDateError.message = "no start date defined";
    } else {
      details.startDate.errors.push({
        type: DateDetailError.UNSET,
        message: "no start date defined",
      });
    }
  }

  if (!endDate) {
    details.endDate = details.endDate || {};
    details.endDate.errors = details.endDate.errors || [];
    const unsetEndDateError = details.endDate.errors.find(
      (err) => err.type === DateDetailError.UNSET,
    );
    if (unsetEndDateError) {
      unsetEndDateError.message = "no end date defined";
    } else {
      details.endDate.errors.push({
        type: DateDetailError.UNSET,
        message: "no end date defined",
      });
    }
  }

  // If startDate is after endDate
  if (
    dateAdapter.isValid(startDate) &&
    dateAdapter.isValid(endDate) &&
    dateAdapter.compare(startDate, endDate) > 0
  ) {
    details.startDate = details.startDate || {};
    details.startDate.errors = details.startDate.errors || [];
    details.startDate.errors.push({
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
    details.startDate = details.startDate || {};
    details.startDate.errors = details.startDate.errors || [];
    details.startDate.errors.push({
      type: "min-date",
      message: "is before min date",
    });
  }
  // If startDate is after maxDate
  if (
    maxDate &&
    dateAdapter.isValid(startDate) &&
    dateAdapter.compare(startDate, maxDate) > 0
  ) {
    details.startDate = details.startDate || {};
    details.startDate.errors = details.startDate.errors || [];
    details.startDate.errors.push({
      type: "max-date",
      message: "is after max date",
    });
  }
  if (
    minDate &&
    dateAdapter.isValid(endDate) &&
    dateAdapter.compare(endDate, minDate) < 0
  ) {
    details.endDate = details.endDate || {};
    details.endDate.errors = details.endDate.errors || [];
    details.endDate.errors.push({
      type: "max-date",
      message: "is before min date",
    });
  }
  // If endDate is after maxDate
  if (
    maxDate &&
    dateAdapter.isValid(endDate) &&
    dateAdapter.compare(endDate, maxDate) > 0
  ) {
    details.endDate = details.endDate || {};
    details.endDate.errors = details.endDate.errors || [];
    details.endDate.errors.push({
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
    endInputProps,
    startInputProps,
    defaultValue,
    format = "DD MMM YYYY",
    value: valueProp,
    validate,
    onChange,
    onDateValueChange,
    ...rest
  } = props;

  const { CalendarIcon } = useIcon();

  const {
    state: {
      selectedDate,
      disabled,
      readOnly,
      cancelled,
      minDate,
      maxDate,
      timezone,
    },
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: run when date changes to sync the value
  useEffect(() => {
    setValue({
      startDate: !selectedDate?.startDate
        ? ""
        : selectedDate?.startDate && dateAdapter.isValid(selectedDate.startDate)
          ? dateAdapter.format(selectedDate.startDate, format)
          : value?.startDate,
      endDate: !selectedDate?.endDate
        ? ""
        : selectedDate?.endDate && dateAdapter.isValid(selectedDate.endDate)
          ? dateAdapter.format(selectedDate.endDate, format)
          : value?.endDate,
    });
  }, [dateAdapter, format, selectedDate]);

  const handleCalendarButton: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (event) => {
        event.persist();
        setOpen(!open, event.nativeEvent, "click");
        event.stopPropagation();
      },
      [open, setOpen],
    );

  const handleDateChange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<TDate> | null,
      details: DateInputRangeDetails,
    ) => {
      const validatedDetails = validate
        ? validate(date, details)
        : defaultRangeValidator(dateAdapter, date, details, minDate, maxDate);
      select(event, date, validatedDetails);
    },
    [dateAdapter, select, minDate, maxDate, validate],
  );

  const handleDateValueChange = useCallback(
    (event: SyntheticEvent | null, newDateValue: DateInputRangeValue) => {
      setValue(newDateValue);
      onDateValueChange?.(event, newDateValue);
    },
    [onDateValueChange],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: should run when open changes and not selected date or value
  useEffect(() => {
    if (open) {
      previousValue.current = value;
    }
  }, [open]);

  useEffect(() => {
    if (cancelled) {
      setValue(previousValue.current);
    }
  }, [cancelled]);

  return (
    <DateInputRange
      value={
        value ?? {
          startDate: "",
          endDate: "",
        }
      }
      className={clsx(withBaseName(), className)}
      date={selectedDate ?? null}
      startInputProps={startInputProps}
      endInputProps={endInputProps}
      readOnly={readOnly}
      disabled={disabled}
      ref={ref}
      onDateChange={handleDateChange}
      onDateValueChange={handleDateValueChange}
      onChange={onChange}
      endAdornment={
        !readOnly && (
          <Button
            appearance="transparent"
            sentiment="neutral"
            onClick={handleCalendarButton}
            disabled={disabled}
            aria-label="Open Calendar"
          >
            <CalendarIcon aria-hidden />
          </Button>
        )
      }
      format={format}
      timezone={timezone}
      {...rest}
    />
  );
});

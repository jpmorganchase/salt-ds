import { Button, makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
import { CalendarIcon } from "@salt-ds/icons";
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
  DateInputParserEnum,
  DateInputRange,
  type DateInputRangeProps,
  type DateInputParserResult,
  type DateInputRangeValue,
} from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";
import type {DateValue} from "@internationalized/date";
import type {DateRangeSelection} from "../calendar";

const withBaseName = makePrefixer("saltDatePickerRangeInput");

/**
 * Result of parsing the date range and applying any validation
 */
export type DateInputRangeResult<V = DateValue> = {
  /** Result of parsing the start date and applying any validation */
  startDate: DateInputParserResult<V>;
  /** Result of parsing the end date and applying any validation */
  endDate: DateInputParserResult<V>;
};

/**
 * Props for the DatePickerRangeInput component.
 */
export interface DatePickerRangeInputProps<T = DateValue> extends DateInputRangeProps {
  /**
   * Function to validate the entered date range and form a selection
   * @param range - The date range to validate
   * @returns selection
   **/
  validate?: (range: DateInputRangeResult<T>) => DateInputRangeResult<T>;
}

export function defaultRangeValidator(
  result: DateInputRangeResult,
): DateInputRangeResult {
  const startDate = result.startDate.date;
  const endDate = result.endDate.date;

  // If endDate but no startDate defined
  if (startDate === undefined && endDate) {
    result.startDate.errors?.push({
      type: DateInputParserEnum.UNSET,
      message: "no start date defined",
    });
  }
  // If startDate is after endDate
  if (startDate && endDate && startDate.compare(endDate) > 0) {
    result.startDate.errors?.push({
      type: "greater-than-end-date",
      message: "start date after end date",
    });
  }
  return result;
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
    validate = defaultRangeValidator,
    onChange,
    onDateValueChange,
    ...rest
  } = props;

  const {
    state: { selectedDate, disabled, readOnly, cancelled, locale, timeZone },
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
    (_event: SyntheticEvent, date: DateRangeSelection, result: DateInputRangeResult) => {
      const validatedSelection = validate(result)
      select(validatedSelection);
    },
    [select],
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

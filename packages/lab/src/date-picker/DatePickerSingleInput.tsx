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
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  DateInputSingle,
  type DateInputSingleProps,
  DateInputSingleDetails,
} from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";
import type { DateValue } from "@internationalized/date";
import type { SingleDateSelection } from "../calendar";

const withBaseName = makePrefixer("saltDatePickerSingleInput");

/**
 * Props for the DatePickerSingleInput component.
 */
export interface DatePickerSingleInputProps<T = DateValue>
  extends DateInputSingleProps {
  /**
   * Function to validate the entered date
   * @param details - The details of date selection, either a valid date or error
   * @returns updated DateInputSingleDetails details
   */
  validate?: (details: DateInputSingleDetails<T>) => DateInputSingleDetails<T>;
}

function defaultSingleValidation(
  selection: DateInputSingleDetails,
  minDate: DateValue | undefined,
  maxDate: DateValue | undefined,
) {
  const updatedSelection = { isValid: true, errors: [], ...selection };
  const { date, isValid } = updatedSelection;
  if (date && isValid) {
    if (minDate && date && date.compare(minDate) < 0) {
      selection.errors?.push({
        type: "min-date",
        message: "is before min date",
      });
    }
    if (maxDate && date && date.compare(maxDate) > 0) {
      selection.errors?.push({
        type: "max-date",
        message: "is after max date",
      });
    }
  }
  return selection;
}

export const DatePickerSingleInput = forwardRef<
  HTMLDivElement,
  DatePickerSingleInputProps
>(function DatePickerSingleInput(props, ref) {
  const {
    className,
    onFocus,
    onBlur,
    value: valueProp,
    validate,
    defaultValue,
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
      locale,
      timeZone,
      minDate,
      maxDate,
    },
    helpers: { select },
  } = useDatePickerContext({ selectionVariant: "single" });
  const {
    state: { open, floatingUIResult },
    helpers: { getReferenceProps, setOpen },
  } = useDatePickerOverlay();

  const inputRef = useForkRef<HTMLDivElement>(ref, floatingUIResult?.reference);
  const previousValue = useRef<typeof valueProp>();

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "DatePickerSingleInput",
    state: "value",
  });

  const handleCalendarButton = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const handleDateChange = useCallback(
    (
      _event: SyntheticEvent,
      _date: SingleDateSelection | null | undefined,
      details: DateInputSingleDetails,
    ) => {
      const validatedSelection = validate
        ? validate(details)
        : defaultSingleValidation(details, minDate, maxDate);
      select(validatedSelection);
    },
    [select],
  );

  const handleDateValueChange = (
    newDateValue: string,
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
      setValue(previousValue?.current);
    }
  }, [cancelled]);

  return (
    <DateInputSingle
      value={value || ""}
      locale={locale}
      timeZone={timeZone}
      className={clsx(withBaseName(), className)}
      ref={inputRef}
      date={selectedDate || null}
      readOnly={readOnly}
      onDateChange={handleDateChange}
      onDateValueChange={handleDateValueChange}
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
      {...getReferenceProps({
        ...rest,
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "ArrowDown") {
            setOpen(true);
          }
        },
      })}
    />
  );
});

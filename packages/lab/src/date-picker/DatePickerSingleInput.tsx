import { Button, makePrefixer, useControlled } from "@salt-ds/core";
import {
  DateDetailError,
  type DateFrameworkType,
  type SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { CalendarIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  forwardRef,
  type MouseEventHandler,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { SingleDateSelection } from "../calendar";
import {
  DateInputSingle,
  type DateInputSingleDetails,
  type DateInputSingleProps,
} from "../date-input";
import { useLocalization } from "../localization-provider";
import {
  type SingleDatePickerState,
  useDatePickerContext,
} from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerSingleInput");

/**
 * Props for the DatePickerSingleInput component.
 */
export interface DatePickerSingleInputProps extends DateInputSingleProps {
  /**
   * Function to validate the entered date
   * @param date - The selected date
   * @param details - The details of date selection, either a valid date or error
   * @returns updated DateInputSingleDetails details
   */
  validate?: (
    date: SingleDateSelection<DateFrameworkType> | null | undefined,
    details: DateInputSingleDetails,
  ) => DateInputSingleDetails;
}

function defaultSingleValidation(
  dateAdapter: SaltDateAdapter<DateFrameworkType>,
  date: DateFrameworkType | null | undefined,
  details: DateInputSingleDetails,
  minDate?: DateFrameworkType,
  maxDate?: DateFrameworkType,
): DateInputSingleDetails {
  if (!date) {
    details.errors = details.errors ?? [];
    const hasUnsetError = details.errors.some(
      (err) => err.type === DateDetailError.UNSET,
    );
    if (!hasUnsetError) {
      details.errors.push({
        type: DateDetailError.UNSET,
        message: "no date defined",
      });
    }
  } else {
    if (
      minDate &&
      dateAdapter.isValid(date) &&
      dateAdapter.compare(date, minDate) < 0
    ) {
      details.errors = details.errors ?? [];
      details.errors?.push({
        type: "min-date",
        message: "is before min date",
      });
    } else if (
      maxDate &&
      dateAdapter.isValid(date) &&
      dateAdapter.compare(date, maxDate) > 0
    ) {
      details.errors = details.errors ?? [];
      details.errors?.push({
        type: "max-date",
        message: "is after max date",
      });
    }
  }
  return details;
}

export const DatePickerSingleInput = forwardRef<
  HTMLDivElement,
  DatePickerSingleInputProps
>((props: DatePickerSingleInputProps, ref: React.Ref<HTMLDivElement>) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();

  const {
    className,
    value: valueProp,
    validate,
    defaultValue,
    onDateValueChange,
    ...rest
  } = props;

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
  } = useDatePickerContext({
    selectionVariant: "single",
  }) as SingleDatePickerState;
  const {
    state: { open },
    helpers: { setOpen },
  } = useDatePickerOverlay();

  const previousValue = useRef<typeof valueProp>();

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: "DatePickerSingleInput",
    state: "value",
  });

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
      date: SingleDateSelection<DateFrameworkType> | null | undefined,
      details: DateInputSingleDetails,
    ) => {
      const validatedDetails =
        validate && date
          ? validate(date, details)
          : defaultSingleValidation(
              dateAdapter,
              date,
              details,
              minDate,
              maxDate,
            );
      select(event, date ?? null, validatedDetails);
    },
    [dateAdapter, minDate, maxDate, select, validate],
  );

  const handleDateValueChange = useCallback(
    (event: SyntheticEvent | null, newDateValue: string) => {
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
      setValue(previousValue?.current);
    }
  }, [cancelled]);

  return (
    <DateInputSingle
      value={value ?? ""}
      className={clsx(withBaseName(), className)}
      date={selectedDate ?? null}
      readOnly={readOnly}
      disabled={disabled}
      ref={ref}
      onDateChange={handleDateChange}
      onDateValueChange={handleDateValueChange}
      endAdornment={
        !readOnly && (
          <Button
            appearance="transparent"
            sentiment="neutral"
            onClick={handleCalendarButton}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-label="Open Calendar"
            aria-expanded={open}
          >
            <CalendarIcon aria-hidden />
          </Button>
        )
      }
      timezone={timezone}
      {...rest}
    />
  );
});

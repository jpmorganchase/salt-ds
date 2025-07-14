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
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerSingleInput");

/**
 * Props for the DatePickerSingleInput component.
 * @template TDate - The type of the date object.
 */
export interface DatePickerSingleInputProps<TDate extends DateFrameworkType>
  extends DateInputSingleProps<TDate> {
  /**
   * Function to validate the entered date
   * @param date - The selected date
   * @param details - The details of date selection, either a valid date or error
   * @returns updated DateInputSingleDetails details
   */
  validate?: (
    date: SingleDateSelection<TDate>,
    details: DateInputSingleDetails,
  ) => DateInputSingleDetails;
}

function defaultSingleValidation<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  date: TDate,
  details: DateInputSingleDetails,
  minDate?: TDate,
  maxDate?: TDate,
): DateInputSingleDetails {
  if (!date) {
    details.errors = details.errors ?? [];
    details.errors?.push({
      type: DateDetailError.UNSET,
      message: "no date defined",
    });
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
  DatePickerSingleInputProps<DateFrameworkType>
>(
  <TDate extends DateFrameworkType>(
    props: DatePickerSingleInputProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const { dateAdapter } = useLocalization<TDate>();

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
    } = useDatePickerContext<TDate>({ selectionVariant: "single" });
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
        date: SingleDateSelection<TDate>,
        details: DateInputSingleDetails,
      ) => {
        const validatedDetails = validate
          ? validate(date, details)
          : defaultSingleValidation<TDate>(
              dateAdapter,
              date,
              details,
              minDate,
              maxDate,
            );
        select(event, date, validatedDetails);
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
              aria-label="Open Calendar"
            >
              <CalendarIcon aria-hidden />
            </Button>
          )
        }
        timezone={timezone}
        {...rest}
      />
    );
  },
);

import { Button, makePrefixer, useControlled } from "@salt-ds/core";
import { CalendarIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  type KeyboardEvent,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { SingleDateSelection } from "../calendar";
import {
  type DateFrameworkType,
  type SaltDateAdapter,
  useLocalization,
} from "../date-adapters";
import {
  DateInputSingle,
  type DateInputSingleDetails,
  type DateInputSingleProps,
} from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerSingleInput");

/**
 * Props for the DatePickerSingleInput component.
 */
export interface DatePickerSingleInputProps<TDate extends DateFrameworkType>
  extends DateInputSingleProps<TDate> {
  /**
   * Function to validate the entered date
   * @param details - The details of date selection, either a valid date or error
   * @returns updated DateInputSingleDetails details
   */
  validate?: (
    details: DateInputSingleDetails<TDate>,
  ) => DateInputSingleDetails<TDate>;
}

function defaultSingleValidation<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  selection: DateInputSingleDetails<TDate>,
  minDate: TDate | undefined,
  maxDate: TDate | undefined,
) {
  const { date } = selection;
  if (date) {
    if (minDate && date && dateAdapter.compare(date, minDate) < 0) {
      selection.errors = selection.errors ?? [];
      selection.errors?.push({
        type: "min-date",
        message: "is before min date",
      });
    } else if (maxDate && date && dateAdapter.compare(date, maxDate) > 0) {
      selection.errors = selection.errors ?? [];
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
  DatePickerSingleInputProps<any>
>(
  <TDate extends DateFrameworkType>(
    props: DatePickerSingleInputProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const { dateAdapter } = useLocalization<TDate>();

    const {
      className,
      onFocus,
      onBlur,
      value: valueProp,
      validate,
      defaultValue,
      onDateValueChange,
      onKeyDown,
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
        resetRequired,
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

    const handleCalendarButton = useCallback(() => {
      setOpen(!open);
    }, [open, setOpen]);

    const handleDateChange = useCallback(
      (
        _event: SyntheticEvent,
        _date: SingleDateSelection<TDate> | null | undefined,
        details: DateInputSingleDetails<TDate>,
      ) => {
        const validatedSelection = validate
          ? validate(details)
          : defaultSingleValidation<TDate>(
              dateAdapter,
              details,
              minDate,
              maxDate,
            );
        select(validatedSelection);
      },
      [select, validate],
    );

    const handleDateValueChange = useCallback(
      (newDateValue: string) => {
        setValue(newDateValue);
        onDateValueChange?.(newDateValue);
      },
      [onDateValueChange],
    );

    const handleOnKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
          setOpen(true);
          onKeyDown?.(event);
        }
      },
      [onKeyDown],
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
        setValue(previousValue?.current);
      }
    }, [cancelled]);

    useEffect(() => {
      if (resetRequired) {
        setValue("");
      }
    }, [resetRequired]);

    return (
      <DateInputSingle
        value={value || ""}
        className={clsx(withBaseName(), className)}
        date={selectedDate || null}
        readOnly={readOnly}
        ref={ref}
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
        onKeyDown={handleOnKeyDown}
        {...rest}
      />
    );
  },
);

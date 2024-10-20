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
import type { SingleDateSelection } from "../calendar";
import {
  DateInputSingle,
  type DateInputSingleError,
  type DateInputSingleProps,
} from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerSingleInput");

/**
 * Props for the DatePickerSingleInput component.
 */
export interface DatePickerSingleInputProps extends DateInputSingleProps {}

export const DatePickerSingleInput = forwardRef<
  HTMLDivElement,
  DatePickerSingleInputProps
>(function DatePickerSingleInput(props, ref) {
  const {
    className,
    onFocus,
    onBlur,
    value: valueProp,
    defaultValue,
    onDateValueChange,
    ...rest
  } = props;

  const { CalendarIcon } = useIcon();

  const {
    state: { selectedDate, disabled, readOnly, cancelled, locale, timeZone },
    helpers: { setSelectedDate },
  } = useDatePickerContext({ selectionVariant: "single" });
  const {
    state: { open, floatingUIResult },
    helpers: { getReferenceProps, setOpen },
  } = useDatePickerOverlay();

  const inputRef = useForkRef<HTMLDivElement>(ref, floatingUIResult?.reference);
  const prevState = useRef<
    { date: typeof selectedDate; value: typeof valueProp } | undefined
  >();

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
      newDate: SingleDateSelection | null,
      error: DateInputSingleError,
    ) => {
      setSelectedDate(newDate, error);
    },
    [setSelectedDate],
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
      prevState.current = { date: selectedDate, value };
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: avoid excessive re-rendering
  useEffect(() => {
    if (cancelled) {
      setValue(prevState?.current?.value);
      setSelectedDate(prevState?.current?.date || null, false);
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

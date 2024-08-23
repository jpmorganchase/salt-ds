import { Button, makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
import { CalendarIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  type FocusEventHandler,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent, KeyboardEventHandler,
} from "react";
import type { DateRangeSelection } from "../calendar";
import {
  DateInputRange,
  type DateInputRangeProps,
  type DateInputRangeValue,
} from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerRangeInput");

export interface DatePickerRangeInputProps extends DateInputRangeProps {}

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
    onChange,
    onDateValueChange,
    ...rest
  } = props;

  const {
    state: {
      selectedDate,
      disabled,
      readOnly,
      cancelled,
      locale,
      timeZone,
    },
    helpers: { setSelectedDate },
  } = useDatePickerContext({ selectionVariant: "range" });
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
    name: "DatePickerRangeInput",
    state: "dateValue",
  });

  const handleCalendarButton = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handleDateChange = useCallback(
    (_event: SyntheticEvent, newDate: DateRangeSelection | null) => {
      setSelectedDate(newDate);
    },
    [],
  );

  const handleDateValueChange = useCallback(
    (newDateValue: DateInputRangeValue, isFormatted: boolean) => {
      setValue(newDateValue);
      onDateValueChange?.(newDateValue, isFormatted);
    },
    [],
  );

  useEffect(() => {
    if (open) {
      prevState.current = { date: selectedDate, value };
    }
  }, [open]);

  useEffect(() => {
    if (cancelled) {
      setValue(prevState?.current?.value);
      setSelectedDate(prevState?.current?.date || null);
    }
  }, [cancelled, setSelectedDate]);

  const startInputProps: {
    onKeyDown: KeyboardEventHandler<HTMLInputElement>
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
    onKeyDown: KeyboardEventHandler<HTMLInputElement>
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
      date={selectedDate}
      startInputProps={getReferenceProps(startInputProps)}
      endInputProps={getReferenceProps(endInputProps)}
      readOnly={readOnly}
      onDateChange={handleDateChange}
      onDateValueChange={handleDateValueChange}
      onChange={onChange}
      endAdornment={
        <Button
          variant="secondary"
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

import { Button, makePrefixer, useControlled, useForkRef } from "@salt-ds/core";
import { CalendarIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  type FocusEventHandler,
  type SyntheticEvent,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import type { SingleDateSelection } from "../calendar";
import { DateInputSingle, type DateInputSingleProps } from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerSingleInput");

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

  const {
    state: {
      selectedDate,
      focusedValue,
      disabled,
      readOnly,
      cancelled,
      locale,
      timeZone,
    },
    helpers: { setSelectedDate, setFocusedValue },
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

  const handleCalendarButton = () => {
    setOpen(!open);
  };

  const handleDateChange = (
    _event: SyntheticEvent,
    newDate: SingleDateSelection | null,
  ) => {
    setSelectedDate(newDate);
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    setFocusedValue("start");
    onFocus?.(event);
  };
  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    setFocusedValue(null);
    onBlur?.(event);
  };

  const handleDateValueChange = (
    newDateValue: string,
    isFormatted: boolean,
  ) => {
    setValue(newDateValue);
    onDateValueChange?.(newDateValue, isFormatted);
  };

  useEffect(() => {
    if (open) {
      prevState.current = { date: selectedDate, value };
    }
  }, [open, selectedDate, value]);

  useEffect(() => {
    if (cancelled) {
      setValue(prevState?.current?.value);
      setSelectedDate(prevState?.current?.date || null);
    }
  }, [cancelled, setSelectedDate]);

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
      focusedInput={focusedValue === "start"}
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
      {...getReferenceProps({
        onBlur: handleBlur,
        onFocus: handleFocus,
        ...rest,
      })}
    />
  );
});

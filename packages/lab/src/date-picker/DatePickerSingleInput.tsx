import {
  type FocusEventHandler,
  type KeyboardEvent,
  type SyntheticEvent,
  forwardRef,
} from "react";
import { clsx } from "clsx";
import { Button, makePrefixer, useForkRef } from "@salt-ds/core";
import { CalendarIcon } from "@salt-ds/icons";
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
  const { className, onFocus, onBlur, value, ...rest } = props;

  const {
    state: { selectedDate, focusedValue, disabled, readOnly, cancelled },
    helpers: { apply, setSelectedDate, setFocusedValue },
  } = useDatePickerContext({ selectionVariant: "single" });
  const {
    state: { open, floatingUIResult },
    helpers: { getReferenceProps, setOpen },
  } = useDatePickerOverlay();

  const inputRef = useForkRef<HTMLDivElement>(ref, floatingUIResult?.reference);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      apply(selectedDate);
    }
  };

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

  return (
    <DateInputSingle
      value={value}
      className={clsx(withBaseName(), className)}
      ref={inputRef}
      date={selectedDate || null}
      readOnly={readOnly}
      onDateChange={handleDateChange}
      focusedInput={focusedValue === "start"}
      endAdornment={
        <Button
          variant="secondary"
          onClick={handleCalendarButton}
          disabled={disabled}
          aria-label="Open Calendar"
        >
          <CalendarIcon aria-hidden />
        </Button>
      }
      {...getReferenceProps({
        onBlur: handleBlur,
        onFocus: handleFocus,
        onKeyDown: handleKeyDown,
        ...rest,
      })}
    />
  );
});

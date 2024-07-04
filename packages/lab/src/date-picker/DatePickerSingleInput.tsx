import {
  FocusEventHandler,
  forwardRef,
  KeyboardEvent,
  SyntheticEvent
} from "react";
import { clsx } from "clsx";
import { Button, makePrefixer, useForkRef } from "@salt-ds/core";
import { DateInputSingle, DateInputSingleProps } from "../date-input";
import { CalendarIcon } from "@salt-ds/icons";
import { useDatePickerContext } from "./DatePickerContext";
import { SingleSelectionValueType } from "../calendar";

const withBaseName = makePrefixer("saltDatePickerSingleInput");

export interface DatePickerSingleInputProps extends DateInputSingleProps {}

export const DatePickerSingleInput = forwardRef<
  HTMLDivElement,
  DatePickerSingleInputProps
>(function DatePickerSingleInput(props, ref) {
  const { className, onFocus, onBlur, ...rest } = props;

  const {
    state: {
      selectedDate,
      open,
      focusedInput,
      floatingUIResult,
      disabled,
      readOnly,
    },
    helpers: { setSelectedDate, getReferenceProps, setOpen, setFocusedInput },
  } = useDatePickerContext<SingleSelectionValueType>();

  const inputRef = useForkRef<HTMLDivElement>(ref, floatingUIResult?.reference);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setOpen(false);
    }
  };

  const handleCalendarButton = () => {
    setOpen(!open);
  };

  const handleDateChange = (
    _event: SyntheticEvent,
    newDate: SingleSelectionValueType | null
  ) => {
    setSelectedDate(newDate);
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    setFocusedInput("start");
    onFocus?.(event);
  };
  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    setFocusedInput(null);
    onBlur?.(event);
  };

  return (
    <DateInputSingle
      className={clsx(withBaseName(), className)}
      ref={inputRef}
      date={selectedDate || null}
      readOnly={readOnly}
      onDateChange={handleDateChange}
      focusedInput={focusedInput === "start"}
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

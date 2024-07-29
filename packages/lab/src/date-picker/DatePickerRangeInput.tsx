import {
  type FocusEventHandler,
  type KeyboardEvent,
  type SyntheticEvent,
  forwardRef,
} from "react";
import { clsx } from "clsx";
import { Button, makePrefixer, useForkRef } from "@salt-ds/core";
import { CalendarIcon } from "@salt-ds/icons";
import type { DateRangeSelection } from "../calendar";
import { DateInputRange, type DateInputRangeProps } from "../date-input";
import { useDatePickerContext } from "./DatePickerContext";
import {useDatePickerOverlay} from "./DatePickerOverlayProvider";

const withBaseName = makePrefixer("saltDatePickerRangeInput");

export interface DatePickerRangeInputProps
  extends Omit<DateInputRangeProps, "focusedValue"> {}

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
    value,
    onChange,
    ...rest
  } = props;

  const {
    state: {
      selectedDate,
      focusedValue,
      disabled,
      readOnly,
    },
    helpers: { setSelectedDate, setFocusedValue },
  } = useDatePickerContext({ selectionVariant: "range"});
  const {
    state: { open, floatingUIResult },
    helpers: { getReferenceProps, setOpen },
  } = useDatePickerOverlay();

  const inputRef = useForkRef<HTMLDivElement>(ref, floatingUIResult?.reference);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setOpen(false);
    }
    onKeyDown?.(event);
  };

  const handleCalendarButton = () => {
    setOpen(!open);
  };

  const handleDateChange = (
    _event: SyntheticEvent,
    newDate: DateRangeSelection | null,
  ) => {
    setSelectedDate(newDate);
  };

  const startInputProps: {
    onBlur: FocusEventHandler<HTMLInputElement>;
    onFocus: FocusEventHandler<HTMLInputElement>;
  } = {
    onBlur: (event) => {
      setFocusedValue(null);
      startInputPropsProp?.onBlur?.(event);
    },
    onFocus: (event) => {
      setFocusedValue("start");
      startInputPropsProp?.onFocus?.(event);
    },
    ...startInputPropsProp,
  };
  const endInputProps: {
    onBlur: FocusEventHandler<HTMLInputElement>;
    onFocus: FocusEventHandler<HTMLInputElement>;
  } = {
    onBlur: (event) => {
      setFocusedValue(null);
      endInputPropsProp?.onBlur?.(event);
    },
    onFocus: (event) => {
      setFocusedValue("end");
      endInputPropsProp?.onFocus?.(event);
    },
    ...endInputPropsProp,
  };

  return (
    <DateInputRange
      className={clsx(withBaseName(), className)}
      ref={inputRef}
      date={selectedDate}
      focusedInput={focusedValue}
      startInputProps={startInputProps}
      endInputProps={endInputProps}
      readOnly={readOnly}
      onDateChange={handleDateChange}
      onChange={onChange}
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
      defaultValue={defaultValue}
      value={value}
      {...getReferenceProps({
        onKeyDown: handleKeyDown,
        ...rest,
      })}
    />
  );
});

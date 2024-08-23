import {
  CalendarDate,
  type DateValue,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
} from "@internationalized/date";
import { useControlled, useForkRef, useFormFieldProps } from "@salt-ds/core";
import { useEffect, useRef, useState } from "react";
import {
  CALENDAR_MAX_YEAR,
  CALENDAR_MIN_YEAR,
  type DateRangeSelection,
  type SingleDateSelection,
  getCurrentLocale,
  isDateRangeSelection,
} from "../calendar";
import type { DatePickerState } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

interface UseDatePickerBaseProps<T> {
  disabled?: boolean;
  readOnly?: boolean;
  open?: boolean;
  defaultOpen?: UseDatePickerBaseProps<T>["open"];
  selectedDate?: T | null;
  defaultSelectedDate?: UseDatePickerBaseProps<T>["selectedDate"];
  onSelectedDateChange?: (newDate: T | null) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  timeZone?: string;
  locale?: string;
}

export interface UseDatePickerSingleProps
  extends UseDatePickerBaseProps<SingleDateSelection> {
  selectionVariant: "single";
}

export interface UseDatePickerRangeProps
  extends UseDatePickerBaseProps<DateRangeSelection> {
  selectionVariant: "range";
}

export type UseDatePickerProps<SelectionVariant> =
  SelectionVariant extends "single"
    ? UseDatePickerSingleProps
    : SelectionVariant extends "range"
      ? UseDatePickerRangeProps
      : never;

export function useDatePicker<SelectionVariant extends "single" | "range">(
  props: UseDatePickerProps<SelectionVariant>,
  ref: React.ForwardedRef<HTMLDivElement>,
): DatePickerState<SingleDateSelection> | DatePickerState<DateRangeSelection> {
  const {
    readOnly = false,
    disabled,
    selectionVariant,
    defaultSelectedDate = null,
    selectedDate: selectedDateProp,
    onSelectedDateChange,
    defaultOpen = false,
    open: openProp,
    minDate: minDateProp,
    maxDate: maxDateProp,
    timeZone = getLocalTimeZone(),
    locale = getCurrentLocale(),
    ...rest
  } = props;

  const minDate: DateValue =
    minDateProp ?? startOfMonth(new CalendarDate(CALENDAR_MIN_YEAR, 1, 1));
  const maxDate: DateValue =
    maxDateProp ?? endOfMonth(new CalendarDate(CALENDAR_MAX_YEAR, 1, 1));

  const datePickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(ref, datePickerRef);

  const {
    state: { open },
    helpers: { setOpen },
  } = useDatePickerOverlay();

  const [selectedDate, setSelectedDate] = useControlled({
    controlled: selectedDateProp,
    default: defaultSelectedDate,
    name: "DatePicker",
    state: "selectedDate",
  });

  const [autoApplyDisabled, setAutoApplyDisabled] = useState<boolean>(false);
  const [cancelled, setCancelled] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setCancelled(false);
    }
  }, [open]);

  const { disabled: formFieldDisabled, readOnly: formFieldReadOnly } =
    useFormFieldProps();
  const isReadOnly = readOnly || formFieldReadOnly || false;
  const isDisabled = disabled || formFieldDisabled || false;

  const apply = (
    newDate: SingleDateSelection | DateRangeSelection | null,
  ): void => {
    setCancelled(false);
    if (newDate === null) {
      onSelectedDateChange?.(newDate);
    } else {
      if (selectionVariant === "range") {
        const newRangeDate = newDate as DateRangeSelection;
        if (newRangeDate?.startDate && newRangeDate?.endDate) {
          setOpen(false);
        }
        onSelectedDateChange?.(newRangeDate);
      } else {
        const newSingleDate = newDate as SingleDateSelection;
        if (newSingleDate) {
          setOpen(false);
        }
        onSelectedDateChange?.(newSingleDate);
      }
    }
  };

  const setSelectedDateWrapper = (
    newDate: SingleDateSelection | DateRangeSelection | null,
  ) => {
    let inRangeNewDate: typeof newDate;
    let startDateInRange = true;
    let endDateInRange = true;
    if (isDateRangeSelection(newDate)) {
      if (maxDate && newDate?.startDate) {
        startDateInRange = newDate.startDate.compare(minDate) >= 0;
      }
      if (maxDate && newDate?.endDate) {
        endDateInRange =
          newDate?.endDate && newDate.endDate.compare(maxDate) <= 0;
      }
      if (!startDateInRange && !endDateInRange) {
        inRangeNewDate = null;
      } else {
        inRangeNewDate = {
          startDate: startDateInRange ? newDate.startDate : undefined,
          endDate: endDateInRange ? newDate.endDate : undefined,
        };
      }
    } else {
      let dateAfterMinDate = true;
      let dateBeforeMaxDate = true;
      if (minDate && newDate) {
        dateAfterMinDate = newDate.compare(minDate) >= 0;
      }
      if (maxDate && newDate) {
        dateBeforeMaxDate = newDate.compare(maxDate) <= 0;
      }
      inRangeNewDate = dateAfterMinDate && dateBeforeMaxDate ? newDate : null;
    }
    setSelectedDate(inRangeNewDate);
    if (!autoApplyDisabled) {
      apply(inRangeNewDate);
    }
  };

  const cancel = () => {
    setCancelled(true);
    setOpen(false);
  };

  const returnValue = {
    state: {
      selectionVariant,
      selectedDate,
      cancelled,
      autoApplyDisabled,
      disabled: isDisabled,
      readOnly: isReadOnly,
      containerRef,
      minDate,
      maxDate,
      locale,
      timeZone,
      ...rest,
    },
    helpers: {
      apply,
      cancel,
      setSelectedDate: setSelectedDateWrapper,
      setAutoApplyDisabled,
    },
  };
  if (props.selectionVariant === "range") {
    return returnValue as DatePickerState<DateRangeSelection>;
  }
  return returnValue as DatePickerState<SingleDateSelection>;
}

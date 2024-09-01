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
} from "../calendar";
import type {
  RangeDatePickerError,
  RangeDatePickerState,
  SingleDatePickerError,
  SingleDatePickerState,
} from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

interface UseDatePickerBaseProps<T> {
  /** if `true`, the component is disabled. */
  disabled?: boolean;
  /** if `true`, the component is read only. */
  readOnly?: boolean;
  /**
   * the selected date, `true` to open. The selected date will be controlled when this prop is provided.
   */
  selectedDate?: T | null;
  /**
   * the initial selected date, when the selected date is un-controlled.
   */
  defaultSelectedDate?: UseDatePickerBaseProps<T>["selectedDate"];
  /**
   * the minimum date for the range, default is 1900
   */
  minDate?: DateValue;
  /**
   * the maximum date for the range, default is 2100
   */
  maxDate?: DateValue;
  /**
   * handler for when the date selection is cancelled
   */
  onCancel?: () => void;
  /**
   * timeZone of the date selection, default to current time zone of user
   */
  timeZone?: string;
  /**
   * locale of the date selection, default to current locale of user
   */
  locale?: string;
}

export interface UseDatePickerSingleProps
  extends UseDatePickerBaseProps<SingleDateSelection> {
  /**
   * single date selection
   */
  selectionVariant: "single";
  /**
   * handler called when selected date changes
   * @param selectedDate selected date
   * @param error error returned by parser or `false`
   */
  onSelectedDateChange?: (
    selectedDate: SingleDateSelection | null,
    error: string | false,
  ) => void;
  /**
   * handler called when selected date is confirmed/applied
   * @param appliedDate selected date
   * @param error error returned by parser or `false`
   */
  onApply?: (
    appliedDate: SingleDateSelection | null,
    error: string | false,
  ) => void;
}

export interface UseDatePickerRangeProps
  extends UseDatePickerBaseProps<DateRangeSelection> {
  /**
   * date range selection
   */
  selectionVariant: "range";
  /**
   * handler called when selected date changes
   * @param selectedDate selected date
   * @param error error returned by parser or `false`  */
  onSelectedDateChange?: (
    selectedDate: DateRangeSelection | null,
    error: { startDate: string | false; endDate: string | false },
  ) => void;
  /**
   * handler called when selected date is confirmed/applied
   * @param appliedDate selected date
   * @param error error returned by parser or `false`
   **/
  onApply?: (
    appliedDate: DateRangeSelection | null,
    error: { startDate: string | false; endDate: string | false },
  ) => void;
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
): SingleDatePickerState | RangeDatePickerState {
  const {
    readOnly = false,
    disabled,
    selectionVariant,
    defaultSelectedDate = null,
    selectedDate: selectedDateProp,
    onSelectedDateChange,
    onApply,
    minDate: minDateProp,
    maxDate: maxDateProp,
    timeZone = getLocalTimeZone(),
    locale = getCurrentLocale(),
    onCancel,
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

  const applySingle = (
    appliedDate: SingleDateSelection | null,
    error: SingleDatePickerError,
  ): void => {
    setCancelled(false);
    setOpen(false);
    if (selectionVariant === "single") {
      onApply?.(appliedDate, error);
    }
  };

  const setSelectedSingleDate = (
    selection: SingleDateSelection | null,
    error: SingleDatePickerError,
  ) => {
    let nextDate: typeof selection;
    let nextError = error;
    if (error || !selection) {
      nextDate = selection;
    } else {
      let dateAfterMinDate = true;
      let dateBeforeMaxDate = true;
      if (minDate && selection) {
        dateAfterMinDate = selection.compare(minDate) >= 0;
      }
      if (maxDate && selection) {
        dateBeforeMaxDate = selection.compare(maxDate) <= 0;
      }
      nextDate = dateAfterMinDate && dateBeforeMaxDate ? selection : null;
      nextError = !dateAfterMinDate ? "is before min date" : nextError;
      nextError = !dateBeforeMaxDate ? "is after max date" : nextError;
    }
    setSelectedDate(nextDate);
    if (selectionVariant === "single") {
      onSelectedDateChange?.(nextDate, error);
    }
    if (!autoApplyDisabled || !open) {
      applySingle(nextDate, nextError);
    }
  };

  const applyRange = (
    appliedDate: DateRangeSelection | null,
    error: RangeDatePickerError,
  ): void => {
    setCancelled(false);
    if (appliedDate?.startDate && appliedDate?.endDate) {
      setOpen(false);
    }
    if (selectionVariant === "range") {
      onApply?.(appliedDate, error);
    }
  };

  const setSelectedRangeDate = (
    selection: DateRangeSelection | null,
    error: RangeDatePickerError,
  ) => {
    let nextDate: typeof selection;
    let nextError = { ...error };
    let startDateInRange = true;
    let endDateInRange = true;
    if (error || !selection) {
      nextDate = selection;
    } else {
      if (maxDate && selection?.startDate) {
        startDateInRange = selection.startDate.compare(minDate) >= 0;
      }
      if (maxDate && selection?.endDate) {
        endDateInRange =
          selection?.endDate && selection.endDate.compare(maxDate) <= 0;
      }
      if (!startDateInRange && !endDateInRange) {
        nextDate = null;
        nextError = {
          startDate: "is before min date",
          endDate: "is after max date",
        };
      } else {
        nextDate = {
          startDate: startDateInRange ? selection.startDate : null,
          endDate: endDateInRange ? selection.endDate : null,
        };
        nextError = {
          startDate: startDateInRange
            ? nextError.startDate
            : "is before min date",
          endDate: startDateInRange ? nextError.endDate : "is after max date",
        };
      }
    }
    setSelectedDate(nextDate);
    if (selectionVariant === "range") {
      onSelectedDateChange?.(nextDate, nextError);
    }
    if (!autoApplyDisabled || !open) {
      applyRange(nextDate, nextError);
    }
  };

  const cancel = () => {
    setCancelled(true);
    setOpen(false);
    onCancel?.();
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
      cancel,
      setAutoApplyDisabled,
    },
  };
  if (props.selectionVariant === "range") {
    return {
      ...returnValue,
      helpers: {
        ...returnValue.helpers,
        apply: applyRange,
        setSelectedDate: setSelectedRangeDate,
      },
    } as RangeDatePickerState;
  }
  return {
    ...returnValue,
    helpers: {
      ...returnValue.helpers,
      apply: applySingle,
      setSelectedDate: setSelectedSingleDate,
    },
  } as SingleDatePickerState;
}

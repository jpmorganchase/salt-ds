import {
  CalendarDate,
  type DateValue,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
} from "@internationalized/date";
import { useControlled, useForkRef, useFormFieldProps } from "@salt-ds/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  /** If `true`, the component is disabled. */
  disabled?: boolean;
  /** If `true`, the component is read-only. */
  readOnly?: boolean;
  /**
   * The selected date. The selected date will be controlled when this prop is provided.
   */
  selectedDate?: T | null;
  /**
   * The initial selected date, when the selected date is uncontrolled.
   */
  defaultSelectedDate?: UseDatePickerBaseProps<T>["selectedDate"];
  /**
   * The minimum date for the range, default is 1900.
   */
  minDate?: DateValue;
  /**
   * The maximum date for the range, default is 2100.
   */
  maxDate?: DateValue;
  /**
   * Handler for when the date selection is cancelled.
   */
  onCancel?: () => void;
  /**
   * Time zone of the date selection, defaults to the current time zone of the user.
   */
  timeZone?: string;
  /**
   * Locale of the date selection, defaults to the current locale of the user.
   */
  locale?: string;
}

/**
 * Props for single date selection.
 *
 * @typedef {UseDatePickerBaseProps<SingleDateSelection>} UseDatePickerSingleProps
 * @property {"single"} selectionVariant - Single date selection.
 * @property {(selectedSingleDate: SingleDateSelection | null, singleError: string | false) => void} [onSelectionChange] - Handler called when the selected date changes.
 * @property {(appliedSingleDate: SingleDateSelection | null, singleError: string | false) => void} [onApply] - Handler called when the selected date is confirmed/applied.
 */
export interface UseDatePickerSingleProps
  extends UseDatePickerBaseProps<SingleDateSelection> {
  /**
   * Single date selection.
   */
  selectionVariant: "single";
  /**
   * Handler called when the selected date changes.
   * @param {SingleDateSelection | null} selectedSingleDate - The selected date.
   * @param {string | false} singleError - Error returned by the parser or `false`.
   */
  onSelectionChange?: (
    selectedSingleDate: SingleDateSelection | null,
    singleError: string | false,
  ) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param {SingleDateSelection | null} appliedSingleDate - The selected date.
   * @param {string | false} singleError - Error returned by the parser or `false`.
   */
  onApply?: (
    appliedSingleDate: SingleDateSelection | null,
    singleError: string | false,
  ) => void;
}

/**
 * Props for date range selection.
 *
 * @typedef {UseDatePickerBaseProps<DateRangeSelection>} UseDatePickerRangeProps
 * @property {"range"} selectionVariant - Date range selection.
 * @property {(selectedRangeDate: DateRangeSelection | null, rangeError: { startDate: string | false; endDate: string | false }) => void} [onSelectionChange] - Handler called when the selected date changes.
 * @property {(appliedRangeDate: DateRangeSelection | null, rangeError: { startDate: string | false; endDate: string | false }) => void} [onApply] - Handler called when the selected date is confirmed/applied.
 */
export interface UseDatePickerRangeProps
  extends UseDatePickerBaseProps<DateRangeSelection> {
  /**
   * Date range selection.
   */
  selectionVariant: "range";
  /**
   * Handler called when the selected date changes.
   * @param {DateRangeSelection | null} selectedRangeDate - The selected date.
   * @param {{ startDate: string | false; endDate: string | false }} rangeError - Error returned by the parser or `false`.
   */
  onSelectionChange?: (
    selectedRangeDate: DateRangeSelection | null,
    rangeError: { startDate: string | false; endDate: string | false },
  ) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param {DateRangeSelection | null} appliedRangeDate - The selected date.
   * @param {{ startDate: string | false; endDate: string | false }} rangeError - Error returned by the parser or `false`.
   */
  onApply?: (
    appliedRangeDate: DateRangeSelection | null,
    rangeError: { startDate: string | false; endDate: string | false },
  ) => void;
}

/**
 * Props for the useDatePicker hook.
 *
 * @template SelectionVariant
 * @typedef {SelectionVariant extends "single" ? UseDatePickerSingleProps : SelectionVariant extends "range" ? UseDatePickerRangeProps : never} UseDatePickerProps
 */
export type UseDatePickerProps<SelectionVariant> =
  SelectionVariant extends "single"
    ? UseDatePickerSingleProps
    : SelectionVariant extends "range"
      ? UseDatePickerRangeProps
      : never;

/**
 * Custom hook for managing date picker state.
 *
 * @template SelectionVariant
 * @param {UseDatePickerProps<SelectionVariant>} props - The props for the date picker.
 * @param {React.ForwardedRef<HTMLDivElement>} ref - The ref for the date picker container.
 * @returns {DatePickerState<SelectionVariant extends "single" ? SingleDateSelection : DateRangeSelection>} The date picker state and helpers.
 */
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
    onSelectionChange,
    onApply,
    minDate: minDateProp,
    maxDate: maxDateProp,
    timeZone = getLocalTimeZone(),
    locale = getCurrentLocale(),
    onCancel,
  } = props;

  const minDate: DateValue = useMemo(
    () =>
      minDateProp ?? startOfMonth(new CalendarDate(CALENDAR_MIN_YEAR, 1, 1)),
    [minDateProp],
  );
  const maxDate: DateValue = useMemo(
    () => maxDateProp ?? endOfMonth(new CalendarDate(CALENDAR_MAX_YEAR, 1, 1)),
    [maxDateProp],
  );

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

  const [enableApply, setEnableApply] = useState<boolean>(false);
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

  const setSelectedSingleDate = useCallback(
    (selection: SingleDateSelection | null, error: SingleDatePickerError) => {
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
        onSelectionChange?.(nextDate, nextError);
      }

      if (!enableApply) {
        setOpen(false);
      }
    },
    [
      enableApply,
      minDate,
      maxDate,
      onSelectionChange,
      selectionVariant,
      setSelectedDate,
      setOpen,
    ],
  );

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

  const setSelectedRangeDate = useCallback(
    (selection: DateRangeSelection | null, error: RangeDatePickerError) => {
      let nextDate: typeof selection;
      let nextError = { ...error };
      let startDateInRange = true;
      let endDateInRange = true;
      if (error?.startDate || error?.endDate || !selection) {
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
          nextDate = { ...selection };
          nextError = {
            startDate: "is before min date",
            endDate: "is after max date",
          };
        } else {
          nextDate = { ...selection };
          nextError = {
            startDate: !startDateInRange
              ? "is before min date"
              : nextError.startDate,
            endDate: !endDateInRange ? "is after max date" : nextError.endDate,
          };
        }
      }
      setSelectedDate(nextDate);
      if (selectionVariant === "range") {
        onSelectionChange?.(nextDate, nextError);
      }
      if (!enableApply && nextDate?.startDate && nextDate?.endDate) {
        setOpen(false);
      }
    },
    [
      enableApply,
      minDate,
      maxDate,
      onSelectionChange,
      selectionVariant,
      setSelectedDate,
      setOpen,
    ],
  );

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
      enableApply,
      disabled: isDisabled,
      readOnly: isReadOnly,
      containerRef,
      minDate,
      maxDate,
      locale,
      timeZone,
    },
    helpers: {
      cancel,
      setEnableApply,
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

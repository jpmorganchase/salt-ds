import {
  CalendarDate,
  type DateValue,
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
} from "@internationalized/date";
import { useControlled, useForkRef, useFormFieldProps } from "@salt-ds/core";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CALENDAR_MAX_YEAR,
  CALENDAR_MIN_YEAR,
  type DateRangeSelection,
  type SingleDateSelection,
  getCurrentLocale,
} from "../calendar";
import type {
  RangeDatePickerState,
  SingleDatePickerState,
} from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";
import { DateInputSingleDetails } from "../date-input";
import { DateInputRangeDetails } from "./DatePickerRangeInput";

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
   * @param {DateInputSingleDetails} selectedSingleDate - The selected date selection.
   */
  onSelectionChange?: (selection: DateInputSingleDetails) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param {SingleDateSelection | null undefined} selectedSingleDate - The selected date selection.   */
  onApply?: (appliedDate: SingleDateSelection | null | undefined) => void;
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
   * @param {DateInputRangeDetails} selection - The selected date selection.   */
  onSelectionChange?: (selection: DateInputRangeDetails) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param {DateRangeSelection} selection - The selected date selection.   */
  onApply?: (appliedRange: DateRangeSelection) => void;
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
    defaultSelectedDate,
    selectedDate: selectedDateProp,
    onSelectionChange,
    onApply,
    minDate = startOfMonth(new CalendarDate(CALENDAR_MIN_YEAR, 1, 1)),
    maxDate = endOfMonth(new CalendarDate(CALENDAR_MAX_YEAR, 1, 1)),
    timeZone = getLocalTimeZone(),
    locale = getCurrentLocale(),
    onCancel,
  } = props;

  const previousSelectedDate = useRef<typeof selectedDateProp>();
  const datePickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(ref, datePickerRef);

  const {
    state: { open },
    helpers: { setOpen, setOnDismiss },
  } = useDatePickerOverlay();

  const [selectedDate, setSelectedDate] = useControlled({
    controlled: selectedDateProp,
    default: defaultSelectedDate,
    name: "DatePicker",
    state: "selectedDate",
  });

  const [enableApply, setEnableApply] = useState<boolean>(false);
  const [cancelled, setCancelled] = useState<boolean>(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: should run when open changes and not selected date or value
  useEffect(() => {
    if (open) {
      previousSelectedDate.current = selectedDate;
      setOnDismiss(cancel);
      setCancelled(false);
    }
  }, [open, setOnDismiss, setCancelled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: avoid excessive re-rendering
  useEffect(() => {
    if (cancelled) {
      setSelectedDate(previousSelectedDate?.current);
    }
  }, [cancelled, setSelectedDate]);

  const { disabled: formFieldDisabled, readOnly: formFieldReadOnly } =
    useFormFieldProps();
  const isReadOnly = readOnly || formFieldReadOnly || false;
  const isDisabled = disabled || formFieldDisabled || false;

  const applySingle = (appliedDate: SingleDateSelection | null): void => {
    setCancelled(false);
    setOpen(false);
    if (selectionVariant === "single") {
      onApply?.(appliedDate);
    }
  };

  const selectSingle = useCallback(
    (selection: DateInputSingleDetails) => {
      setSelectedDate(selection.date);
      if (selectionVariant === "single") {
        onSelectionChange?.(selection);
      }
      if (!enableApply && selection.date !== undefined) {
        applySingle(selection.date);
      }
    },
    [enableApply, onSelectionChange, selectionVariant, setSelectedDate],
  );

  const applyRange = useCallback(
    (appliedDate: DateRangeSelection): void => {
      setCancelled(false);
      setOpen(false);
      if (selectionVariant === "range") {
        onApply?.(appliedDate);
      }
    },
    [onApply, setCancelled, setOpen, selectionVariant],
  );

  const selectRange = useCallback(
    (details: DateInputRangeDetails) => {
      const { startDate: startDateSelection, endDate: endDateSelection } =
        details;
      setSelectedDate({
        startDate: startDateSelection?.date,
        endDate: endDateSelection?.date,
      });
      if (selectionVariant === "range") {
        onSelectionChange?.(details);
      }
      if (!enableApply && details?.startDate?.date && details?.endDate?.date) {
        applyRange({
          startDate: startDateSelection?.date,
          endDate: endDateSelection?.date,
        });
      }
    },
    [
      applyRange,
      enableApply,
      onSelectionChange,
      selectionVariant,
      setSelectedDate,
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
        select: selectRange,
      },
    } as RangeDatePickerState;
  }
  return {
    ...returnValue,
    helpers: {
      ...returnValue.helpers,
      apply: applySingle,
      select: selectSingle,
    },
  } as SingleDatePickerState;
}

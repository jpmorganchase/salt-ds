import { useControlled, useForkRef, useFormFieldProps } from "@salt-ds/core";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import { type DateFrameworkType, useLocalization } from "../date-adapters";
import type {
  DateInputRangeDetails,
  DateInputSingleDetails,
} from "../date-input";
import type {
  RangeDatePickerState,
  SingleDatePickerState,
} from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

interface UseDatePickerBaseProps<TDate> {
  /** If `true`, the component is disabled. */
  disabled?: boolean;
  /** If `true`, the component is read-only. */
  readOnly?: boolean;
  /**
   * The minimum date for the range, default is 1900.
   */
  minDate?: TDate;
  /**
   * The maximum date for the range, default is 2100.
   */
  maxDate?: TDate;
  /**
   * Handler for when the date selection is cancelled.
   */
  onCancel?: () => void;
}

/**
 * Props for single date selection.
 *
 * @typedef {UseDatePickerBaseProps<SingleDateSelection>} UseDatePickerSingleProps
 * @property {"single"} selectionVariant - Single date selection.
 * @property {(selectedSingleDate: SingleDateSelection | null, singleError: string | false) => void} [onSelectionChange] - Handler called when the selected date changes.
 * @property {(appliedSingleDate: SingleDateSelection | null, singleError: string | false) => void} [onApply] - Handler called when the selected date is confirmed/applied.
 */
export interface UseDatePickerSingleProps<TDate extends DateFrameworkType>
  extends UseDatePickerBaseProps<TDate> {
  /**
   * Single date selection.
   */
  selectionVariant: "single";
  /**
   * The selected date. The selected date will be controlled when this prop is provided.
   */
  selectedDate?: SingleDateSelection<TDate> | null;
  /**
   * The initial selected date, when the selected date is uncontrolled.
   */
  defaultSelectedDate?: SingleDateSelection<TDate> | null;
  /**
   * Handler called when the selected date changes.
   * @param {DateInputSingleDetails} selectedSingleDate - The selected date selection.
   */
  onSelectionChange?: (selection: DateInputSingleDetails<TDate>) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param {SingleDateSelection | null undefined} selectedSingleDate - The selected date selection.   */
  onApply?: (
    appliedDate: SingleDateSelection<TDate> | null | undefined,
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
export interface UseDatePickerRangeProps<TDate extends DateFrameworkType>
  extends UseDatePickerBaseProps<TDate> {
  /**
   * Date range selection.
   */
  selectionVariant: "range";
  /**
   * The selected date. The selected date will be controlled when this prop is provided.
   */
  selectedDate?: DateRangeSelection<TDate> | null;
  /**
   * The initial selected date, when the selected date is uncontrolled.
   */
  defaultSelectedDate?: DateRangeSelection<TDate> | null;
  /**
   * Handler called when the selected date changes.
   * @param {DateInputRangeDetails} selection - The selected date selection.   */
  onSelectionChange?: (selection: DateInputRangeDetails<TDate>) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param {DateRangeSelection} selection - The selected date selection.   */
  onApply?: (appliedRange: DateRangeSelection<TDate>) => void;
}

/**
 * Props for the useDatePicker hook.
 *
 * @template SelectionVariant
 * @typedef {SelectionVariant extends "single" ? UseDatePickerSingleProps : SelectionVariant extends "range" ? UseDatePickerRangeProps : never} UseDatePickerProps
 */
export type UseDatePickerProps<
  TDate extends DateFrameworkType,
  SelectionVariant,
> = SelectionVariant extends "single"
  ? UseDatePickerSingleProps<TDate>
  : SelectionVariant extends "range"
    ? UseDatePickerRangeProps<TDate>
    : never;

/**
 * Custom hook for managing date picker state.
 *
 * @template SelectionVariant
 * @param {UseDatePickerProps<SelectionVariant>} props - The props for the date picker.
 * @param {React.ForwardedRef<HTMLDivElement>} ref - The ref for the date picker container.
 * @returns {DatePickerState<SelectionVariant extends "single" ? SingleDateSelection : DateRangeSelection>} The date picker state and helpers.
 */
export function useDatePicker<
  TDate extends DateFrameworkType,
  SelectionVariant extends "single" | "range",
>(
  props: UseDatePickerProps<TDate, SelectionVariant>,
  ref: React.ForwardedRef<HTMLDivElement>,
): SingleDatePickerState<TDate> | RangeDatePickerState<TDate> {
  const {
    defaultDates: { minDate: defaultMinDate, maxDate: defaultMaxDate },
  } = useLocalization<TDate>();
  const {
    readOnly = false,
    disabled,
    selectionVariant,
    defaultSelectedDate,
    selectedDate: selectedDateProp,
    onSelectionChange,
    onApply,
    minDate = defaultMinDate,
    maxDate = defaultMaxDate,
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
  const [resetRequired, setResetRequired] = useState<boolean>(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: should run when open changes and not selected date or value
  useEffect(() => {
    if (open) {
      previousSelectedDate.current = selectedDate;
      if (enableApply) {
        setOnDismiss(cancel);
      }
      setCancelled(false);
    }
  }, [enableApply, open, setOnDismiss, setCancelled]);

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

  const applySingle = (
    appliedDate: SingleDateSelection<TDate> | null,
  ): void => {
    setResetRequired(false);
    setCancelled(false);
    setOpen(false);
    if (selectionVariant === "single") {
      onApply?.(appliedDate);
    }
  };

  const selectSingle = useCallback(
    (selection: DateInputSingleDetails<TDate>) => {
      setResetRequired(false);
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
    (appliedDate: DateRangeSelection<TDate>): void => {
      setResetRequired(false);
      setCancelled(false);
      setOpen(false);
      if (selectionVariant === "range") {
        onApply?.(appliedDate);
      }
    },
    [onApply, setCancelled, setOpen, selectionVariant],
  );

  const selectRange = useCallback(
    (details: DateInputRangeDetails<TDate>) => {
      setResetRequired(false);
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

  const cancel = useCallback(() => {
    setCancelled(true);
    setOpen(false);
    onCancel?.();
  }, [setCancelled, setOpen, onCancel]);

  const reset = useCallback(() => {
    setResetRequired(true);
  }, [setResetRequired]);

  const returnValue = {
    state: {
      selectionVariant,
      selectedDate,
      cancelled,
      enableApply,
      disabled: isDisabled,
      readOnly: isReadOnly,
      resetRequired,
      containerRef,
      minDate,
      maxDate,
    },
    helpers: {
      cancel,
      reset,
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
    } as RangeDatePickerState<TDate>;
  }
  return {
    ...returnValue,
    helpers: {
      ...returnValue.helpers,
      apply: applySingle,
      select: selectSingle,
    },
  } as SingleDatePickerState<TDate>;
}

import { useControlled, useForkRef, useFormFieldProps } from "@salt-ds/core";
import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
 * @template TDate - The type of the date framework.
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
   * @param event - The synthetic event.
   * @param date - The selected date or null.
   * @param details - The selected date details.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    date: SingleDateSelection<TDate> | null,
    details: DateInputSingleDetails,
  ) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param event - The synthetic event.
   * @param appliedDate - The selected date or null.
   */
  onApply?: (
    event: SyntheticEvent,
    appliedDate: SingleDateSelection<TDate> | null,
  ) => void;
}

/**
 * Props for date range selection.
 *
 * @template TDate - The type of the date framework.
 */
export interface UseDatePickerRangeProps<TDate extends DateFrameworkType>
  extends UseDatePickerBaseProps<TDate> {
  /**
   * Date range selection.
   */
  selectionVariant: "range";
  /**
   * The selected date range. The selected date will be controlled when this prop is provided.
   */
  selectedDate?: DateRangeSelection<TDate> | null;
  /**
   * The initial selected date range, when the selected date is uncontrolled.
   */
  defaultSelectedDate?: DateRangeSelection<TDate> | null;
  /**
   * Handler called when the selected date range changes.
   * @param event - The synthetic event.
   * @param date - The selected date range or null.
   * @param details - The selected date range details.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    date: DateRangeSelection<TDate> | null,
    details: DateInputRangeDetails,
  ) => void;
  /**
   * Handler called when the selected date range is confirmed/applied.
   * @param event - The synthetic event.
   * @param appliedRange - The selected date range.
   */
  onApply?: (
    event: SyntheticEvent,
    appliedRange: DateRangeSelection<TDate>,
  ) => void;
}

/**
 * Props for the useDatePicker hook.
 *
 * @template TDate - The type of the date framework.
 * @template SelectionVariant - The selection variant, either "single" or "range".
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
 * @template TDate - The type of the date framework.
 * @template SelectionVariant - The selection variant, either "single" or "range".
 * @param props - The props for the date picker.
 * @param ref - The ref for the date picker container.
 * @returns The date picker state and helpers.
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
    event: SyntheticEvent,
    appliedDate: SingleDateSelection<TDate> | null,
  ): void => {
    setCancelled(false);
    setOpen(false);
    if (selectionVariant === "single") {
      onApply?.(event, appliedDate);
    }
  };

  const selectSingle = useCallback(
    (event: SyntheticEvent, date: SingleDateSelection<TDate>, details: DateInputSingleDetails) => {
      setSelectedDate(date);
      if (selectionVariant === "single") {
        onSelectionChange?.(event, date, details);
      }
      if (!enableApply && date) {
        applySingle(event, date);
      }
    },
    [enableApply, onSelectionChange, selectionVariant, setSelectedDate],
  );

  const applyRange = useCallback(
    (event: SyntheticEvent, appliedDate: DateRangeSelection<TDate>): void => {
      setCancelled(false);
      setOpen(false);
      if (selectionVariant === "range") {
        onApply?.(event, appliedDate);
      }
    },
    [onApply, setCancelled, setOpen, selectionVariant],
  );

  const selectRange = useCallback(
    (event: SyntheticEvent, date: DateRangeSelection<TDate>, details: DateInputRangeDetails) => {
      setSelectedDate(date);
      if (selectionVariant === "range") {
        onSelectionChange?.(event, date, details);
      }
      if (!enableApply && date?.startDate && date?.endDate) {
        applyRange(event, date);
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

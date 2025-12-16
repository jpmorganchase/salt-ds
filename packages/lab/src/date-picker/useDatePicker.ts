import { useControlled, useForkRef, useFormFieldProps } from "@salt-ds/core";
import type { DateFrameworkType, Timezone } from "@salt-ds/date-adapters";
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { DateRangeSelection, SingleDateSelection } from "../calendar";
import {
  type CreateAnnouncement,
  useDateSelectionAnnouncer,
} from "../calendar";
import {
  createRangeSelectionAnnouncement,
  createSingleSelectionAnnouncement,
} from "../calendar/internal/createAnnouncement";
import type {
  DateInputRangeDetails,
  DateInputSingleDetails,
} from "../date-input";
import { useLocalization } from "../localization-provider";
import type {
  RangeDatePickerState,
  SingleDatePickerState,
} from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

interface UseDatePickerBaseProps<TDate> {
  /**
   * Factory method for date selection live announcements or null to silence announcements
   */
  createAnnouncement?: CreateAnnouncement<TDate> | null;
  /**
   * If `true`, the component is disabled.
   */
  disabled?: boolean;
  /**
   * Function to determine if a day is highlighted.
   * @param date - The date to check.
   * @returns A string reason if the day is highlighted, otherwise `false` or `undefined`.
   */
  isDayHighlighted?: (date: TDate) => string | false | undefined;
  /**
   * Function to determine if a day is unselectable.
   * @param date - The date to check.
   * @returns A string reason if the day is unselectable, otherwise `false` or `undefined`.
   */
  isDayUnselectable?: (date: TDate) => string | false | undefined;
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
  /**
   * Timezone, if un-defined will take the timezone from passed date (or defaultSelectedDate/selectedDate)
   * Can also be set to "default" to use the default timezone of the date library
   * Can also be set to "system" to take the timezone of the local system.
   */
  timezone?: Timezone;
}

/**
 * Props for single date selection.
 * @template TDate - The type of the date object.
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
    details?: DateInputSingleDetails,
  ) => void;
  /**
   * Handler called when the selected date is confirmed/applied.
   * @param event - The synthetic event.
   * @param date - The selected date or null.
   */
  onApply?: (
    event: SyntheticEvent,
    date: SingleDateSelection<TDate> | null,
  ) => void;
}

/**
 * Props for date range selection.
 * @template TDate - The type of the date object.
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
    details?: DateInputRangeDetails,
  ) => void;
  /**
   * Handler called when the selected date range is confirmed/applied.
   * @param event - The synthetic event.
   * @param date - The selected date range.
   */
  onApply?: (
    event: SyntheticEvent,
    date: DateRangeSelection<TDate> | null,
  ) => void;
}

/**
 * Props for the useDatePicker hook.
 * @template TDate - The type of the date object.
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
 * @template TDate - The type of the date object.
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
    dateAdapter,
    defaultDates: { minDate: defaultMinDate, maxDate: defaultMaxDate },
  } = useLocalization<TDate>();
  const {
    createAnnouncement,
    readOnly = false,
    disabled,
    selectionVariant,
    defaultSelectedDate,
    isDayHighlighted,
    isDayUnselectable,
    selectedDate: selectedDateProp,
    onSelectionChange,
    onApply,
    minDate = defaultMinDate,
    maxDate = defaultMaxDate,
    onCancel,
    timezone,
  } = props;

  const previousSelectedDate = useRef<typeof selectedDateProp>();
  const datePickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(ref, datePickerRef);

  const { announce } = useDateSelectionAnnouncer(
    (createAnnouncement ?? selectionVariant === "single")
      ? createSingleSelectionAnnouncement
      : createRangeSelectionAnnouncement,
    dateAdapter,
  );

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

  const applySingle = useCallback(
    (event: SyntheticEvent, date: SingleDateSelection<TDate> | null): void => {
      setCancelled(false);
      setOpen(false, event.nativeEvent, "apply");
      announce("dateSelected", { selectedDate: date });
      if (selectionVariant === "single") {
        onApply?.(event, date);
      }
    },
    [selectionVariant, setOpen, onApply],
  );

  const checkAndAddError = useCallback(
    (
      date: TDate | null | undefined,
      checkFunction: ((date: TDate) => string | false | undefined) | undefined,
      errorType: string,
      details: {
        errors?: { type: string; message: string | false | undefined }[];
      } = {},
    ) => {
      const errorMessage = date ? checkFunction?.(date) : false;
      if (errorMessage) {
        details.errors = details.errors ?? [];
        details.errors.push({
          type: errorType,
          message: errorMessage,
        });
      }
    },
    [],
  );

  const selectSingle = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<TDate> | null,
      details: DateInputSingleDetails,
    ) => {
      const canBeApplied =
        dateAdapter.isValid(date) && !details?.errors?.length;
      setSelectedDate(date);
      checkAndAddError(date, isDayUnselectable, "unselectable", details);

      if (selectionVariant === "single") {
        onSelectionChange?.(event, date, details);
      }
      if (!enableApply && canBeApplied) {
        applySingle(event, date);
      }
    },
    [
      checkAndAddError,
      dateAdapter,
      applySingle,
      isDayUnselectable,
      enableApply,
      onSelectionChange,
      selectionVariant,
    ],
  );

  const applyRange = useCallback(
    (event: SyntheticEvent, date: DateRangeSelection<TDate> | null): void => {
      setCancelled(false);
      setOpen(false, event.nativeEvent, "apply");
      announce("dateSelected", { selectedDate: date });
      if (selectionVariant === "range") {
        onApply?.(event, date);
      }
    },
    [onApply, setOpen, selectionVariant],
  );

  const selectRange = useCallback(
    (
      event: SyntheticEvent,
      date: DateRangeSelection<TDate> | null,
      details: DateInputRangeDetails,
    ) => {
      setSelectedDate(date);
      checkAndAddError(
        date?.startDate,
        isDayUnselectable,
        "unselectable",
        details?.startDate,
      );
      checkAndAddError(
        date?.endDate,
        isDayUnselectable,
        "unselectable",
        details?.endDate,
      );

      if (selectionVariant === "range") {
        onSelectionChange?.(event, date, details);
      }
      const isAValidRange =
        dateAdapter.isValid(date?.startDate) &&
        dateAdapter.isValid(date?.endDate);
      const isValidSelection =
        !details?.startDate?.errors?.length &&
        !details?.endDate?.errors?.length;
      const canBeApplied = isAValidRange && isValidSelection;
      if (!enableApply && canBeApplied) {
        applyRange(event, date);
      }
    },
    [
      checkAndAddError,
      dateAdapter,
      applyRange,
      isDayUnselectable,
      enableApply,
      onSelectionChange,
      selectionVariant,
    ],
  );

  const cancel = useCallback(
    (event?: Event) => {
      setCancelled(true);
      setOpen(false, event, "cancel");
      onCancel?.();
    },
    [setOpen, onCancel],
  );

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
      timezone,
    },
    helpers: {
      cancel,
      isDayHighlighted,
      isDayUnselectable,
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

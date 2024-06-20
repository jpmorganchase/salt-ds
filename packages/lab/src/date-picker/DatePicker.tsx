import { clsx } from "clsx";
import {
  ChangeEvent,
  forwardRef,
  SyntheticEvent,
  useRef,
  useState,
} from "react";

import {
  Button,
  makePrefixer,
  useControlled,
  useFloatingUI,
  useForkRef,
  useFormFieldProps,
} from "@salt-ds/core";
import { DatePickerContext } from "./DatePickerContext";
import { DatePickerPanel } from "./DatePickerPanel";
import { flip, useDismiss, useInteractions } from "@floating-ui/react";
import { DateInput, DateInputProps } from "../date-input";
import { DateValue, getLocalTimeZone, today } from "@internationalized/date";
import { CalendarIcon } from "@salt-ds/icons";
import {
  CalendarProps,
  isRangeOrOffsetSelectionWithStartDate,
  RangeSelectionValueType,
  SingleSelectionValueType,
} from "../calendar";

const withBaseName = makePrefixer("saltDatePicker");

export interface DatePickerProps<SelectionVariantType>
  extends DateInputProps<SelectionVariantType> {
  /**
   * Selection variant. Defaults to single select.
   */
  selectionVariant?: "default" | "range";
  /**
   * If `true`, the component will be disabled.
   */
  disabled?: boolean;
  /**
   * The selected date value. Use when the component is controlled.
   * Can be a single date or an object with start and end dates for range selection.
   */
  selectedDate?: SelectionVariantType;
  /**
   * The default date value. Use when the component is not controlled.
   * Can be a single date or an object with start and end dates for range selection.
   */
  defaultSelectedDate?: SelectionVariantType;
  /**
   * Props to be passed to the Calendar component.
   */
  CalendarProps?: Partial<
    Omit<
      CalendarProps,
      | "selectionVariant"
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectedDateChange"
    >
  >;
  /**
   * Function to format the input value.
   */
  dateFormatter?: (input: DateValue | undefined) => string;
  /**
   * Callback function triggered when open state changes.
   */
  onOpenChange?: (newOpen: boolean) => void;
  /**
   * Display or hide the component.
   */
  open?: boolean;
  /**
   * The default open value. Use when the component is not controlled.
   */
  defaultOpen?: boolean;
  /**
   * Helper text to display in the panel
   */
  helperText?: string;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Callback fired when the selected date change.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate?: SelectionVariantType
  ) => void;
  /**
   * Callback fired when the input value change.
   */
  onChange?: SelectionVariantType extends SingleSelectionValueType
    ? (
        event: ChangeEvent<HTMLInputElement>,
        selectedDateInputValue?: string
      ) => void
    : (
        event: ChangeEvent<HTMLInputElement>,
        startDateInputValue?: string,
        endDateInputValue?: string
      ) => void;
  /**
   * Number of Calendars to be shown if selectionVariant is range.
   * 2 is the default value.
   */
  visibleMonths?: 1 | 2;
}

export const DatePicker = forwardRef<
  HTMLDivElement,
  DatePickerProps<SingleSelectionValueType | RangeSelectionValueType>
>(function DatePicker(
  {
    selectionVariant = "default",
    disabled = false,
    placeholder = "dd mmm yyyy",
    selectedDate: selectedDateProp,
    defaultSelectedDate,
    dateFormatter,
    CalendarProps,
    className,
    open: openProp,
    defaultOpen,
    onOpenChange: onOpenChangeProp,
    helperText,
    readOnly: readOnlyProp,
    validationStatus,
    onSelectionChange,
    onChange,
    visibleMonths = 2,
    ...rest
  },
  ref
) {
  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: Boolean(defaultOpen),
    name: "openPanel",
    state: "openPanel",
  });

  const [selectedDate, setSelectedDate] = useControlled({
    controlled: selectedDateProp,
    default: defaultSelectedDate,
    name: "Calendar",
    state: "selectedDate",
  });

  const [startVisibleMonth, setStartVisibleMonth] = useState<
    DateValue | undefined
  >(
    (isRangeOrOffsetSelectionWithStartDate(selectedDate)
      ? selectedDate?.startDate
      : selectedDate) ?? today(getLocalTimeZone())
  );

  const [endVisibleMonth, setEndVisibleMonth] = useState<DateValue | undefined>(
    (isRangeOrOffsetSelectionWithStartDate(selectedDate)
      ? selectedDate.startDate?.add({ months: 1 })
      : selectedDate) ?? today(getLocalTimeZone()).add({ months: 1 })
  );

  const onOpenChange = (newState: boolean) => {
    setOpen(newState);
    startInputRef?.current?.focus();
    onOpenChangeProp?.(newState);
  };

  const { x, y, strategy, elements, floating, reference, context } =
    useFloatingUI({
      open: open,
      onOpenChange: onOpenChange,
      placement: "bottom-start",
      middleware: [flip({ fallbackStrategy: "initialPlacement" })],
    });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
  ]);
  const { disabled: formFieldDisabled, readOnly: formFieldReadOnly } =
    useFormFieldProps();
  const isReadOnly = readOnlyProp || formFieldReadOnly;

  const getPanelPosition = () => ({
    top: y ?? 0,
    left: x ?? 0,
    position: strategy,
    width: elements.floating?.offsetWidth,
    height: elements.floating?.offsetHeight,
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useForkRef<HTMLDivElement>(ref, reference);
  const floatingRef = useForkRef<HTMLDivElement>(panelRef, floating);

  // Handlers
  const handleSelect = (
    event: SyntheticEvent,
    selectedDate?: DateValue | { startDate?: DateValue; endDate?: DateValue }
  ) => {
    if (selectionVariant === "default" && selectedDate) {
      startInputRef?.current?.focus();
    }

    if (
      isRangeOrOffsetSelectionWithStartDate(selectedDate) &&
      selectedDate.endDate
    ) {
      endInputRef?.current?.focus();
    }
    onSelectionChange?.(event, selectedDate);
  };
  const handleCalendarButton = () => {
    startInputRef?.current?.focus();
    setOpen(!open);
  };

  // Context
  const datePickerContextValue = {
    openState: open,
    setOpen,
    disabled,
    selectedDate,
    setSelectedDate,
    defaultSelectedDate,
    startVisibleMonth,
    setStartVisibleMonth,
    endVisibleMonth,
    setEndVisibleMonth,
    selectionVariant,
    context,
    getPanelPosition,
  };

  return (
    <DatePickerContext.Provider value={datePickerContextValue}>
      <DateInput
        validationStatus={validationStatus}
        className={clsx(withBaseName(), className)}
        ref={inputRef}
        {...getReferenceProps()}
        startInputRef={startInputRef}
        endInputRef={endInputRef}
        placeholder={placeholder}
        dateFormatter={dateFormatter}
        readOnly={isReadOnly}
        onSelectionChange={onSelectionChange}
        onChange={onChange}
        endAdornment={
          <Button
            variant="secondary"
            onClick={handleCalendarButton}
            disabled={disabled || isReadOnly || formFieldDisabled}
            aria-label="Open Calendar"
          >
            <CalendarIcon aria-hidden />
          </Button>
        }
        {...rest}
      />
      <DatePickerPanel
        ref={floatingRef}
        {...getFloatingProps()}
        onSelect={handleSelect}
        CalendarProps={CalendarProps}
        helperText={helperText}
        visibleMonths={visibleMonths}
      />
    </DatePickerContext.Provider>
  );
});

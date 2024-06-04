import { clsx } from "clsx";
import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
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
import { DateInput } from "../date-input";
import { DateValue, getLocalTimeZone, today } from "@internationalized/date";
import { CalendarIcon } from "@salt-ds/icons";
import {
  CalendarProps,
  isRangeOrOffsetSelectionWithStartDate,
} from "../calendar";

const withBaseName = makePrefixer("saltDatePicker");

export interface DatePickerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  inputAriaLabel?: string;
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
  selectedDate?: DateValue | { startDate?: DateValue; endDate?: DateValue };
  /**
   * The default date value. Use when the component is not controlled.
   * Can be a single date or an object with start and end dates for range selection.
   */
  defaultSelectedDate?:
    | DateValue
    | { startDate: DateValue; endDate: DateValue };
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
   * Helper text to display in the panel
   */
  helperText?: string;
  /**
   * If `true`, the component is read only.
   */
  readOnly?: boolean;
  /**
   * Validation status.
   */
  validationStatus?: "error" | "warning" | "success";
  /**
   * Callback fired when the selected date change.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate?: DateValue | { startDate?: DateValue; endDate?: DateValue }
  ) => void;
  /**
   * Callback fired when the input value change.
   */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  isCompact?: boolean;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
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
      onOpenChange: onOpenChangeProp,
      helperText,
      readOnly: readOnlyProp,
      inputAriaLabel,
      validationStatus,
      onSelectionChange,
      onChange,
      isCompact,
      ...rest
    },
    ref
  ) {
    const [open, setOpen] = useControlled({
      controlled: openProp,
      default: false,
      name: "openPanel",
      state: "openPanel",
    });

    const [startDate, setStartDate] = useControlled({
      controlled: isRangeOrOffsetSelectionWithStartDate(selectedDateProp)
        ? selectedDateProp.startDate
        : selectedDateProp,
      default: isRangeOrOffsetSelectionWithStartDate(defaultSelectedDate)
        ? defaultSelectedDate.startDate
        : defaultSelectedDate,
      name: "StartDate",
      state: "startDate",
    });
    const [endDate, setEndDate] = useControlled({
      controlled: isRangeOrOffsetSelectionWithStartDate(selectedDateProp)
        ? selectedDateProp.endDate
        : selectedDateProp,
      default: isRangeOrOffsetSelectionWithStartDate(defaultSelectedDate)
        ? defaultSelectedDate.endDate
        : undefined,
      name: "EndDate",
      state: "endDate",
    });

    const [startVisibleMonth, setStartVisibleMonth] = useState<
      DateValue | undefined
    >(startDate ?? today(getLocalTimeZone()));
    const [endVisibleMonth, setEndVisibleMonth] = useState<
      DateValue | undefined
    >(
      endDate ??
        startDate?.add({ months: 1 }) ??
        today(getLocalTimeZone()).add({ months: 1 })
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
      if (selectionVariant === "default" && startDate) {
        startInputRef?.current?.focus();
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
      endDate,
      setEndDate,
      defaultEndDate: isRangeOrOffsetSelectionWithStartDate(defaultSelectedDate)
        ? defaultSelectedDate.endDate
        : defaultSelectedDate,
      startDate,
      setStartDate,
      startVisibleMonth,
      setStartVisibleMonth,
      endVisibleMonth,
      setEndVisibleMonth,
      defaultStartDate: isRangeOrOffsetSelectionWithStartDate(
        defaultSelectedDate
      )
        ? defaultSelectedDate.startDate
        : defaultSelectedDate,
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
          ariaLabel={inputAriaLabel}
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
          isCompact={isCompact}
        />
      </DatePickerContext.Provider>
    );
  }
);

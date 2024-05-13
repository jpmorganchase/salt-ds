import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef, useRef, useState } from "react";

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
  UseRangeSelectionCalendarProps,
  UseSingleSelectionCalendarProps,
} from "../calendar";

const withBaseName = makePrefixer("saltDatePicker");

export interface DatePickerProps
  extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue">,
    Pick<
      ComponentPropsWithoutRef<"input">,
      "disabled" | "value" | "defaultValue" | "placeholder"
    > {
  /**
   * Selection variant. Defaults to single select.
   */
  selectionVariant?: "default" | "range";
  /**
   * If `true`, the component will be disabled.
   */
  disabled?: boolean;
  /**
   * The start date value. Use when the component is controlled.
   */
  startDate?: DateValue;
  /**
   * The default start date value. Use when the component is not controlled.
   */
  defaultStartDate?: DateValue;
  /**
   * The end date value. Use when the component is controlled.
   */
  endDate?: DateValue;
  /**
   * The default end date value. Use when the component is not controlled.
   */
  defaultEndDate?: DateValue;
  /**
   * Props to be passed to the Calendar component.
   */
  CalendarProps?:
    | UseRangeSelectionCalendarProps
    | UseSingleSelectionCalendarProps;
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
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    {
      selectionVariant = "default",
      disabled = false,
      placeholder = "dd mmm yyyy",
      startDate: startDateProp,
      endDate: endDateProp,
      defaultStartDate,
      defaultEndDate,
      dateFormatter,
      CalendarProps,
      className,
      open: openProp,
      onOpenChange: onOpenChangeProp,
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
      controlled: startDateProp,
      default: defaultStartDate,
      name: "StartDate",
      state: "startDate",
    });
    const [endDate, setEndDate] = useControlled({
      controlled: endDateProp,
      default: defaultEndDate,
      name: "EndDate",
      state: "endDate",
    });
    const [validationStatusState, setValidationStatus] = useState<
      "error" | undefined
    >(undefined);
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
    const {
      disabled: formFieldDisabled,
      readOnly: formFieldReadOnly,
      a11yProps,
    } = useFormFieldProps();

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
    const handleSelect = () => {
      if (selectionVariant === "default" && startDate) {
        startInputRef?.current?.focus();
      }
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
      defaultEndDate,
      startDate,
      setStartDate,
      startVisibleMonth,
      setStartVisibleMonth,
      endVisibleMonth,
      setEndVisibleMonth,
      defaultStartDate,
      selectionVariant,
      context,
      getPanelPosition,
      validationStatusState,
      setValidationStatus,
    };

    return (
      <DatePickerContext.Provider value={datePickerContextValue}>
        <DateInput
          className={clsx(withBaseName(), className)}
          ref={inputRef}
          {...getReferenceProps()}
          startInputRef={startInputRef}
          endInputRef={endInputRef}
          placeholder={placeholder}
          dateFormatter={dateFormatter}
          endAdornment={
            <Button
              variant="secondary"
              onClick={handleCalendarButton}
              disabled={disabled || formFieldReadOnly || formFieldDisabled}
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
        />
      </DatePickerContext.Provider>
    );
  }
);

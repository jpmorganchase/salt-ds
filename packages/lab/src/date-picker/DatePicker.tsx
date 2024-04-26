import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef, useRef } from "react";

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
import { DateValue } from "@internationalized/date";
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
  selectionVariant?: "default" | "range";
  disabled?: boolean;
  startDate?: DateValue;
  defaultStartDate?: DateValue;
  endDate?: DateValue;
  defaultEndDate?: DateValue;
  CalendarProps?:
    | UseRangeSelectionCalendarProps
    | UseSingleSelectionCalendarProps;
  /**
   * Function to format the input value.
   */
  dateFormatter?: (input: DateValue | undefined) => string;
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
      ...rest
    },
    ref
  ) {
    // const [focusInside, setFocusInside] = useState<boolean>(false);

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

    const { x, y, strategy, elements, floating, reference, context } =
      useFloatingUI({
        open: open,
        onOpenChange: setOpen,
        placement: "bottom-start",
        middleware: [flip({ fallbackStrategy: "initialPlacement" })],
      });

    const dismiss = useDismiss(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);
    const { disabled: formFieldDisabled, readOnly: formFieldReadOnly } =
      useFormFieldProps();

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
      selectionVariant === "range" && startDate
        ? endInputRef?.current?.focus()
        : startInputRef?.current?.focus();
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
      defaultStartDate,
      selectionVariant,
      context,
      getPanelPosition,
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

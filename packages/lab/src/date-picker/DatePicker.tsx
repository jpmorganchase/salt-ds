import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef, useRef, useState } from "react";

import {
  Button,
  makePrefixer,
  useControlled,
  useFloatingUI,
  useForkRef,
} from "@salt-ds/core";
import { DatePickerContext } from "./DatePickerContext";
import { DatePickerPanel } from "./DatePickerPanel";
import { flip, size, useDismiss, useInteractions } from "@floating-ui/react";
import { DateInput } from "../date-input";
import { DateValue } from "@internationalized/date";
import { CalendarIcon } from "@salt-ds/icons";

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
      ...rest
    },
    ref
  ) {
    const [open, setOpen] = useState<boolean>(false);

    const [startDate, setStartDate] = useControlled({
      controlled: startDateProp,
      default: defaultStartDate,
      name: "StartDate",
      state: "value",
    });
    const [endDate, setEndDate] = useControlled({
      controlled: endDateProp,
      default: defaultEndDate,
      name: "EndDateInput",
      state: "value",
    });

    const { x, y, strategy, elements, floating, reference, context } =
      useFloatingUI({
        open: open,
        onOpenChange: setOpen,
        placement: "bottom-start",
        middleware: [
          size({
            apply({ rects, elements, availableHeight }) {
              Object.assign(elements.floating.style, {
                minWidth: `${rects.reference.width}px`,
                maxHeight: `max(calc((var(--salt-size-base) + var(--salt-spacing-100)) * 5), calc(${availableHeight}px - var(--salt-spacing-100)))`,
              });
            },
          }),
          flip({ fallbackStrategy: "initialPlacement" }),
        ],
      });

    const dismiss = useDismiss(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

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
      setOpen(!open);
      startInputRef?.current?.focus();
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
          className={clsx(withBaseName())}
          ref={inputRef}
          {...getReferenceProps()}
          selectionVariant={selectionVariant}
          startInputRef={startInputRef}
          endInputRef={endInputRef}
          placeholder={placeholder}
          endAdornment={
            <Button variant="secondary" onClick={handleCalendarButton}>
              <CalendarIcon />
            </Button>
          }
          {...rest}
        />
        <DatePickerPanel
          ref={floatingRef}
          {...getFloatingProps()}
          onSelect={handleSelect}
        />
      </DatePickerContext.Provider>
    );
  }
);

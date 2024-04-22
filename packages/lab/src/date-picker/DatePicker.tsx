import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef, useState } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import datePickerCss from "./DatePicker.css";
import {
  Button,
  makePrefixer,
  useControlled,
  useFloatingUI,
  useForkRef,
} from "@salt-ds/core";
import { DatePickerContext } from "./DatePickerContext";
import { DatePickerPanel } from "./DatePickerPanel";
import {
  flip,
  size,
  useDismiss,
  useFocus,
  useInteractions,
} from "@floating-ui/react";
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
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-datePicker",
      css: datePickerCss,
      window: targetWindow,
    });

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

    const focus = useFocus(context);
    const dismiss = useDismiss(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([
      focus,
      dismiss,
    ]);

    // const setStartDate = (date: DateValue | null) => {
    //   setStartDateState(date);
    //   if (selectionVariant === "range" && date) {
    //     const secondInput =
    //       refs.reference.current?.querySelectorAll("input")[1];
    //     secondInput?.focus();
    //   }
    // };
    //
    const getPanelPosition = () => ({
      top: y ?? 0,
      left: x ?? 0,
      position: strategy,
      width: elements.floating?.offsetWidth,
      height: elements.floating?.offsetHeight,
    });

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

    const inputRef = useForkRef<HTMLDivElement>(ref, reference);

    const handleCalendarButton = () => {
      setOpen(!open);
      // TODO: move focus to the input
      // from spec, opening should move focus to first item inside panel
    };
    return (
      <DatePickerContext.Provider value={datePickerContextValue}>
        <DateInput
          className={clsx(withBaseName())}
          ref={inputRef}
          {...getReferenceProps()}
          selectionVariant={selectionVariant}
          placeholder={placeholder}
          endAdornment={
            <Button variant="secondary" onClick={handleCalendarButton}>
              <CalendarIcon />
            </Button>
          }
          {...rest}
        />
        <DatePickerPanel ref={floating} {...getFloatingProps()} />
      </DatePickerContext.Provider>
    );
  }
);

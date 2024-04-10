import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useFloatingComponent } from "@salt-ds/core";
import { clsx } from "clsx";
import { useDatePickerContext } from "./DatePickerContext";
import dateInputPanelCss from "./DatePickerPanel.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Calendar } from "../calendar";
import { DateValue } from "@internationalized/date";

export interface DatePickerPanelProps extends ComponentPropsWithoutRef<"div"> {
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerPanel = forwardRef<HTMLDivElement, DatePickerPanelProps>(
  function DatePickerPanel(props, ref) {
    const { className, context , ...rest } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-input-panel",
      css: dateInputPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const { openState, startDate, setStartDate, setOpen, selectionVariant } =
      useDatePickerContext();

    const handleSelectedDateChange = (_, newDate: DateValue) => {
      setStartDate(newDate);
      setOpen(false);
    };
    return (
      <FloatingComponent
        className={clsx(withBaseName(), className)}
        open={openState}
        aria-modal="true"
        ref={ref}
        {...rest}
      >
        <Calendar
          selectionVariant={selectionVariant}
          defaultVisibleMonth={startDate ? startDate : undefined}
          selectedDate={selectionVariant === "default" ? startDate : startDate}
          onSelectedDateChange={handleSelectedDateChange}
        />
      </FloatingComponent>
    );
  }
);

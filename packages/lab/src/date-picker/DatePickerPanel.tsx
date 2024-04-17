import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useFloatingComponent } from "@salt-ds/core";
import { clsx } from "clsx";
import { useDatePickerContext } from "./DatePickerContext";
import dateInputPanelCss from "./DatePickerPanel.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  Calendar,
  UseRangeSelectionCalendarProps,
  UseSingleSelectionCalendarProps,
} from "../calendar";
import { getLocalTimeZone, today } from "@internationalized/date";

export interface DatePickerPanelProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerPanel = forwardRef<HTMLDivElement, DatePickerPanelProps>(
  function DatePickerPanel(props, ref) {
    const { className, ...rest } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-input-panel",
      css: dateInputPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const {
      openState,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      setOpen,
      selectionVariant,
    } = useDatePickerContext();

    const isRangePicker = selectionVariant === "range";

    const setRangeDate: UseRangeSelectionCalendarProps["onSelectedDateChange"] =
      (_, newDate) => {
        if (!startDate && newDate.startDate) {
          setStartDate(newDate.startDate);
        } else {
          newDate.endDate && setEndDate(newDate.endDate);
        }
        setOpen(false);
      };
    const setSingleDate: UseSingleSelectionCalendarProps["onSelectedDateChange"] =
      (_, newDate) => {
        setStartDate(newDate);
        setOpen(false);
      };

    const selectedDate =
      selectionVariant === "default" ? startDate : { startDate, endDate };
    // TODO: calendar is not closing on dismiss - check floating ui implementation
    return (
      <FloatingComponent
        open={openState}
        className={clsx(withBaseName(), className)}
        aria-modal="true"
        ref={ref}
        {...rest}
      >
        <Calendar
          selectionVariant={selectionVariant}
          defaultVisibleMonth={startDate ?? undefined}
          selectedDate={selectedDate}
          onSelectedDateChange={isRangePicker ? setRangeDate : setSingleDate}
        />
        {isRangePicker && (
          <Calendar
            selectionVariant={selectionVariant}
            defaultVisibleMonth={
              startDate
                ? startDate.add({ months: 1 })
                : today(getLocalTimeZone()).add({ months: 1 })
            }
            selectedDate={selectedDate}
            onSelectedDateChange={setRangeDate}
          />
        )}
      </FloatingComponent>
    );
  }
);

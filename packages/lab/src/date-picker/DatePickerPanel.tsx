import { ComponentPropsWithoutRef, forwardRef } from "react";
import {
  FlexLayout,
  makePrefixer,
  StackLayout,
  useFloatingComponent,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { useDatePickerContext } from "./DatePickerContext";
import dateInputPanelCss from "./DatePickerPanel.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  Calendar,
  CalendarProps,
  UseRangeSelectionCalendarProps,
  UseSingleSelectionCalendarProps,
} from "../calendar";
import { getLocalTimeZone, today } from "@internationalized/date";

export interface DatePickerPanelProps extends ComponentPropsWithoutRef<"div"> {
  onSelect?: () => void;
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerPanel = forwardRef<HTMLDivElement, DatePickerPanelProps>(
  function DatePickerPanel(props, ref) {
    const { className, onSelect, ...rest } = props;

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
      context,
      getPanelPosition,
    } = useDatePickerContext();

    const setRangeDate: UseRangeSelectionCalendarProps["onSelectedDateChange"] =
      (_, newDate) => {
        if (!startDate && newDate.startDate) {
          setStartDate(newDate.startDate);
        }
        if (startDate && newDate.startDate) {
          newDate.endDate && setEndDate(newDate.endDate);
        }
        onSelect?.();
        setOpen(false);
      };
    const setSingleDate: UseSingleSelectionCalendarProps["onSelectedDateChange"] =
      (_, newDate) => {
        setStartDate(newDate);
        onSelect?.();
        setOpen(false);
      };

    const isRangePicker = selectionVariant === "range";
    const firstCalendarProps: CalendarProps = isRangePicker
      ? {
          selectionVariant: "range",
          selectedDate: { startDate, endDate },
          onSelectedDateChange: setRangeDate,
        }
      : {
          selectionVariant: "default",
          selectedDate: startDate,
          onSelectedDateChange: setSingleDate,
        };
    return (
      <FloatingComponent
        open={openState}
        className={clsx(withBaseName(), className)}
        aria-modal="true"
        ref={ref}
        focusManagerProps={
          context
            ? {
                context: context,
                initialFocus: 0,
                returnFocus: false,
                modal: false,
              }
            : undefined
        }
        {...getPanelPosition()}
        {...rest}
      >
        <StackLayout>
          <FlexLayout>
            <Calendar
              defaultVisibleMonth={startDate ?? undefined}
              {...firstCalendarProps}
            />
            {isRangePicker && (
              <Calendar
                selectionVariant="range"
                defaultVisibleMonth={
                  startDate
                    ? startDate.add({ months: 1 })
                    : today(getLocalTimeZone()).add({ months: 1 })
                }
                selectedDate={{ startDate, endDate }}
                onSelectedDateChange={setRangeDate}
              />
            )}
          </FlexLayout>
        </StackLayout>
      </FloatingComponent>
    );
  }
);

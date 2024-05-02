import { ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
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
  CalendarProps?: Partial<
    Omit<
      CalendarProps,
      | "selectionVariant"
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectedDateChange"
    >
  >;
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerPanel = forwardRef<HTMLDivElement, DatePickerPanelProps>(
  function DatePickerPanel(props, ref) {
    const { className, onSelect, CalendarProps, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-picker-panel",
      css: dateInputPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();

    const {
      openState,
      startDate,
      setStartDate,
      startVisibleMonth,
      setStartVisibleMonth,
      endDate,
      setEndDate,
      endVisibleMonth,
      setEndVisibleMonth,
      setOpen,
      selectionVariant,
      context,
      getPanelPosition,
    } = useDatePickerContext();

    const setRangeDate: UseRangeSelectionCalendarProps["onSelectedDateChange"] =
      (_, newDate) => {
        if (!startDate && newDate.startDate) {
          setStartDate(newDate.startDate);
        } else if (startDate && newDate.startDate) {
          if (!newDate.endDate || newDate.startDate <= newDate.endDate) {
            setStartDate(newDate.startDate);
            setEndDate(undefined);
          }
          newDate.endDate && setEndDate(newDate.endDate);
          setOpen(false);
        }
        onSelect?.();
      };
    const setSingleDate: UseSingleSelectionCalendarProps["onSelectedDateChange"] =
      (_, newDate) => {
        setStartDate(newDate);
        onSelect?.();
        setOpen(false);
      };

    useEffect(() => {
      setStartVisibleMonth(startDate);
    }, [startDate]);
    const isRangePicker = selectionVariant === "range";
    const firstCalendarProps: CalendarProps = isRangePicker
      ? {
          selectionVariant: "range",
          selectedDate: { startDate, endDate },
          onSelectedDateChange: setRangeDate,
          maxDate: startDate,
          hideOutOfRangeDates: true,
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
                initialFocus: 4,
              }
            : undefined
        }
        {...getPanelPosition()}
        {...rest}
      >
        <StackLayout>
          <FlexLayout>
            <Calendar
              defaultVisibleMonth={startDate ?? today(getLocalTimeZone())}
              visibleMonth={startVisibleMonth}
              onVisibleMonthChange={(_, month) => setStartVisibleMonth(month)}
              {...firstCalendarProps}
              {...CalendarProps}
            />
            {isRangePicker && (
              <Calendar
                selectionVariant="range"
                defaultVisibleMonth={
                  endDate ??
                  startDate?.add({ months: 1 }) ??
                  today(getLocalTimeZone()).add({ months: 1 })
                }
                selectedDate={{ startDate, endDate }}
                onSelectedDateChange={setRangeDate}
                visibleMonth={endVisibleMonth}
                onVisibleMonthChange={(_, month) => setEndVisibleMonth(month)}
                hideOutOfRangeDates
                minDate={startDate?.add({ months: 1 }) ?? undefined}
                {...CalendarProps}
              />
            )}
          </FlexLayout>
        </StackLayout>
      </FloatingComponent>
    );
  }
);

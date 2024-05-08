import {
  ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useState,
} from "react";
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
import { DateValue, endOfMonth, startOfMonth } from "@internationalized/date";

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
    const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);

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
        setStartDate(newDate.startDate);
        setEndDate(newDate.endDate);
        if (newDate.startDate && newDate.endDate) {
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
    const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
      _,
      newHoveredDate
    ) => {
      setHoveredDate(newHoveredDate);
    };
    useEffect(() => {
      if (startDate) {
        setStartVisibleMonth(startDate);
        setEndVisibleMonth(startDate.add({ months: 1 }));
      }
    }, [startDate]);

    const isRangePicker = selectionVariant === "range";
    const firstCalendarProps: CalendarProps = isRangePicker
      ? {
          selectionVariant: "range",
          hoveredDate:
            startDate &&
            hoveredDate &&
            hoveredDate.compare(endOfMonth(startDate)) > 0
              ? endOfMonth(startDate)
              : hoveredDate,
          onHoveredDateChange: handleHoveredDateChange,
          selectedDate: { startDate, endDate },
          onSelectedDateChange: setRangeDate,
          maxDate: startDate && endOfMonth(startDate),
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
              visibleMonth={startVisibleMonth}
              onVisibleMonthChange={(_, month) => setStartVisibleMonth(month)}
              {...firstCalendarProps}
              {...CalendarProps}
            />
            {isRangePicker && (
              <Calendar
                selectionVariant="range"
                hoveredDate={hoveredDate}
                onHoveredDateChange={handleHoveredDateChange}
                selectedDate={{ startDate, endDate }}
                onSelectedDateChange={setRangeDate}
                visibleMonth={endVisibleMonth}
                onVisibleMonthChange={(_, month) => setEndVisibleMonth(month)}
                hideOutOfRangeDates
                minDate={
                  startDate
                    ? startOfMonth(startDate)?.add({ months: 1 })
                    : undefined
                }
                {...CalendarProps}
              />
            )}
          </FlexLayout>
        </StackLayout>
      </FloatingComponent>
    );
  }
);

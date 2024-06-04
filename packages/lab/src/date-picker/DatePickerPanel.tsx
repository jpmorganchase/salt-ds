import {
  ComponentPropsWithoutRef,
  forwardRef,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import {
  FlexItem,
  FlexLayout,
  FormFieldHelperText,
  makePrefixer,
  StackLayout,
  useFloatingComponent,
  useFormFieldProps,
  FormFieldContext,
  FormFieldContextValue,
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
  onSelect?: (
    event: SyntheticEvent,
    selectedDate?: DateValue | { startDate?: DateValue; endDate?: DateValue }
  ) => void;
  helperText?: string;
  isCompact?: boolean;
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
    const {
      className,
      onSelect,
      helperText,
      CalendarProps,
      isCompact,
      ...rest
    } = props;

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

    const { a11yProps } = useFormFieldProps();

    const setRangeDate: UseRangeSelectionCalendarProps["onSelectedDateChange"] =
      (event, newDate) => {
        setStartDate(newDate.startDate);
        setEndDate(newDate.endDate);
        onSelect?.(event, newDate);
        if (newDate.startDate && newDate.endDate) {
          setOpen(false);
        }
      };
    const setSingleDate: UseSingleSelectionCalendarProps["onSelectedDateChange"] =
      (event, newDate) => {
        setStartDate(newDate);
        onSelect?.(event, newDate);
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
            !isCompact &&
            startDate &&
            hoveredDate &&
            hoveredDate.compare(endOfMonth(startDate)) > 0
              ? endOfMonth(startDate)
              : hoveredDate,
          onHoveredDateChange: handleHoveredDateChange,
          selectedDate: { startDate, endDate },
          onSelectedDateChange: setRangeDate,
          maxDate: !isCompact ? startDate && endOfMonth(startDate) : undefined,
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
        {...a11yProps}
        {...rest}
      >
        <StackLayout separators gap={0} className={withBaseName("container")}>
          {helperText && (
            <FlexItem className={withBaseName("header")}>
              <FormFieldHelperText>{helperText}</FormFieldHelperText>
            </FlexItem>
          )}
          <FlexLayout>
            {/* Avoid Dropdowns in Calendar inheriting the FormField's state */}
            <FormFieldContext.Provider value={{} as FormFieldContextValue}>
              <Calendar
                visibleMonth={startVisibleMonth}
                onVisibleMonthChange={(_, month) => setStartVisibleMonth(month)}
                isCompact={isCompact}
                {...firstCalendarProps}
                {...CalendarProps}
              />
              {isRangePicker && !isCompact && (
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
            </FormFieldContext.Provider>
          </FlexLayout>
        </StackLayout>
      </FloatingComponent>
    );
  }
);

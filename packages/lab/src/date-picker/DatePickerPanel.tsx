import {
  type DateValue,
  endOfMonth,
  startOfMonth,
} from "@internationalized/date";
import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  StackLayout,
  makePrefixer,
  useFloatingComponent,
  useFormFieldProps,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  forwardRef,
  useEffect,
  useState,
} from "react";
import {
  Calendar,
  type CalendarProps,
  type RangeSelectionValueType,
  type SingleSelectionValueType,
  type UseRangeSelectionCalendarProps,
  type UseSingleSelectionCalendarProps,
  isRangeOrOffsetSelectionWithStartDate,
} from "../calendar";
import { useDatePickerContext } from "./DatePickerContext";
import dateInputPanelCss from "./DatePickerPanel.css";

export interface DatePickerPanelProps<SelectionVariantType>
  extends ComponentPropsWithoutRef<"div"> {
  onSelect?: (
    event: SyntheticEvent,
    selectedDate?: SelectionVariantType,
  ) => void;
  helperText?: string;
  visibleMonths?: 1 | 2;
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

function getHoveredDate(
  date?: DateValue | null,
  compact?: boolean,
  hoveredDate?: DateValue | null,
) {
  return date &&
    !compact &&
    hoveredDate &&
    hoveredDate.compare(endOfMonth(date)) > 0
    ? endOfMonth(date)
    : hoveredDate;
}

export const DatePickerPanel = forwardRef<
  HTMLDivElement,
  DatePickerPanelProps<SingleSelectionValueType | RangeSelectionValueType>
>(function DatePickerPanel(props, ref) {
  const {
    className,
    onSelect,
    helperText,
    CalendarProps,
    visibleMonths,
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
    selectedDate,
    setSelectedDate,
    startVisibleMonth,
    setStartVisibleMonth,
    endVisibleMonth,
    setEndVisibleMonth,
    setOpen,
    context,
    getPanelPosition,
    selectionVariant,
  } = useDatePickerContext();

  const { a11yProps } = useFormFieldProps();
  const isRangePicker =
    isRangeOrOffsetSelectionWithStartDate(selectedDate) ||
    (selectionVariant === "range" && selectedDate === undefined);
  const compact = visibleMonths === 1;

  const setRangeDate: UseRangeSelectionCalendarProps["onSelectedDateChange"] = (
    event,
    newDate,
  ) => {
    setSelectedDate(newDate);
    onSelect?.(event, newDate);
    if (newDate.startDate && newDate.endDate) {
      setOpen(false);
    }
  };
  const setSingleDate: UseSingleSelectionCalendarProps["onSelectedDateChange"] =
    (event, newDate) => {
      setSelectedDate(newDate);
      onSelect?.(event, newDate);
      setOpen(false);
    };
  const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
    _,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
  };
  useEffect(() => {
    if (isRangePicker) {
      if (selectedDate?.startDate) {
        setStartVisibleMonth(selectedDate.startDate);
        setEndVisibleMonth(selectedDate.startDate.add({ months: 1 }));
      }
    } else {
      setStartVisibleMonth(selectedDate);
    }
  }, [selectedDate]);

  const firstCalendarProps: CalendarProps = isRangePicker
    ? {
        selectionVariant: "range",
        hoveredDate: getHoveredDate(
          selectedDate?.startDate,
          compact,
          hoveredDate,
        ),
        onHoveredDateChange: handleHoveredDateChange,
        selectedDate: selectedDate,
        onSelectedDateChange: setRangeDate,
        maxDate:
          !compact && selectedDate?.startDate
            ? endOfMonth(selectedDate?.startDate)
            : undefined,
        hideOutOfRangeDates: true,
      }
    : {
        selectionVariant: "default",
        selectedDate: selectedDate,
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
              {...firstCalendarProps}
              {...CalendarProps}
            />
            {isRangePicker && !compact && (
              <Calendar
                selectionVariant="range"
                hoveredDate={hoveredDate}
                onHoveredDateChange={handleHoveredDateChange}
                selectedDate={selectedDate}
                onSelectedDateChange={setRangeDate}
                visibleMonth={endVisibleMonth}
                onVisibleMonthChange={(_, month) => setEndVisibleMonth(month)}
                hideOutOfRangeDates
                minDate={
                  selectedDate?.startDate
                    ? startOfMonth(selectedDate?.startDate)?.add({
                        months: 1,
                      })
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
});

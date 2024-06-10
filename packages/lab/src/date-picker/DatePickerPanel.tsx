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
  FormFieldContext,
  FormFieldContextValue,
  FormFieldHelperText,
  makePrefixer,
  StackLayout,
  useFloatingComponent,
  useFormFieldProps,
} from "@salt-ds/core";
import { clsx } from "clsx";
import { useDatePickerContext } from "./DatePickerContext";
import dateInputPanelCss from "./DatePickerPanel.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  Calendar,
  CalendarProps,
  isRangeOrOffsetSelectionWithStartDate,
  RangeSelectionValueType,
  SingleSelectionValueType,
  UseRangeSelectionCalendarProps,
  UseSingleSelectionCalendarProps,
} from "../calendar";
import { DateValue, endOfMonth, startOfMonth } from "@internationalized/date";

function clampDate(date: DateValue | null, max: DateValue | null) {
  if (!date || !max) return undefined;
  return date.compare(max) === 0 ? max : date;
}

export interface DatePickerPanelProps<SelectionVariantType>
  extends ComponentPropsWithoutRef<"div"> {
  onSelect?: (
    event: SyntheticEvent,
    selectedDate?: SelectionVariantType
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
    newDate
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
    newHoveredDate
  ) => {
    setHoveredDate(newHoveredDate);
  };
  useEffect(() => {
    console.log("selectedDate", selectedDate);
    if (isRangePicker) {
      if (selectedDate?.startDate) {
        console.log("setting: ", selectedDate.startDate);
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
        // This clamps the hovered date to the end of the visible month, otherwise the hovered date is mirrored across calendars.
        hoveredDate:
          selectedDate?.startDate && !compact
            ? clampDate(hoveredDate, endOfMonth(selectedDate?.startDate))
            : hoveredDate,
        onHoveredDateChange: handleHoveredDateChange,
        selectedDate: selectedDate,
        onSelectedDateChange: setRangeDate,
        maxDate: !compact && selectedDate?.startDate ? endOfMonth(selectedDate?.startDate) : undefined,
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
            {isRangePicker && (
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

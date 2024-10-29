import { Button, Divider, StackLayout } from "@salt-ds/core";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type CalendarProps,
  type CalendarRangeProps,
  type CalendarSingleProps,
  CalendarWeekHeader,
  type DateFrameworkType,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type React from "react";
import { type SyntheticEvent, useCallback } from "react";
import { useState } from "react";

import "dayjs/locale/es"; // Import the Spanish locale
import { es as dateFnsEs } from "date-fns/locale";
import "moment/dist/locale/es";

import "./calendar.stories.css";

export default {
  title: "Lab/Calendar",
  component: Calendar,
  args: {
    selectionVariant: "single",
    children: (
      <>
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </>
    ),
  },
} as Meta<typeof Calendar>;

const Template: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  return (
    <Calendar
      {...args}
      selectionVariant={"single"}
      defaultSelectedDate={dateAdapter.today()}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const Single: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const selectedDate = dateAdapter.today();
  return (
    <Calendar
      {...(args as any)}
      defaultSelectedDate={selectedDate}
      selectionVariant="single"
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const Range: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 4 });
  return (
    <Calendar
      {...(args as any)}
      defaultSelectedDate={{ startDate, endDate }}
      selectionVariant="range"
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const Multiselect: StoryFn<typeof Calendar> = ({
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  dateAdapter.locale = "en-GB";
  const defaultSelectedDate = [
    "02/01/2024",
    "03/01/2024",
    "04/01/2024",
    "05/01/2024",
    "06/01/2024",
    "11/01/2024",
    "18/01/2024",
    "22/01/2024",
    "25/01/2024",
    "30/01/2024",
    "31/01/2024",
    "01/02/2024",
    "02/02/2024",
    "03/02/2024",
    "08/02/2024",
    "10/02/2024",
    "15/02/2024",
    "16/02/2024",
    "17/02/2024",
    "22/02/2024",
    "29/02/2024",
    "04/03/2024",
    "05/03/2024",
    "06/03/2024",
    "07/03/2024",
    "08/03/2024",
    "11/03/2024",
    "13/03/2024",
    "15/03/2024",
    "18/03/2024",
    "20/03/2024",
    "22/03/2024",
    "25/03/2024",
    "29/03/2024",
  ].map((date) => dateAdapter.parse(date, "DD/MM/YYYY").date);
  const defaultVisibleMonth = dateAdapter.parse(
    "01/01/2024",
    "DD/MM/YYYY",
  ).date;
  console.log(defaultSelectedDate);
  return (
    <Calendar
      {...(args as any)}
      selectionVariant="multiselect"
      defaultVisibleMonth={defaultVisibleMonth}
      defaultSelectedDate={defaultSelectedDate}
      hideOutOfRangeDates
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const Offset: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const endDateOffset = (date: ReturnType<typeof dateAdapter.date>) =>
    dateAdapter.add(date, { days: 4 });
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 4 });
  return (
    <Calendar
      {...(args as any)}
      defaultSelectedDate={{ startDate, endDate }}
      endDateOffset={endDateOffset}
      selectionVariant="offset"
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const UnselectableDates: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDayUnselectable = (day: ReturnType<typeof dateAdapter.date>) => {
    return dateAdapter.getDayOfWeek(day) >= 5
      ? "Weekends are un-selectable"
      : false;
  };
  return (
    <Calendar
      {...(args as any)}
      selectionVariant="single"
      isDayUnselectable={isDayUnselectable}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const DisabledDates: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDayDisabled = (day: ReturnType<typeof dateAdapter.date>) => {
    return dateAdapter.getDayOfWeek(day) >= 5 ? "Weekends are disabled" : false;
  };
  return (
    <Calendar
      {...(args as any)}
      selectionVariant="single"
      isDayDisabled={isDayDisabled}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const HighlightedDates: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDayHighlighted = (day: ReturnType<typeof dateAdapter.date>) => {
    const startOfMonth = dateAdapter.startOf(day, "month");
    return dateAdapter.isSame(startOfMonth, day, "day")
      ? "Start of month reminder"
      : false;
  };
  return (
    <Calendar
      {...(args as any)}
      selectionVariant="single"
      isDayHighlighted={isDayHighlighted}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const HideOutOfRangeDates: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...(args as any)} selectionVariant="single" hideOutOfRangeDates>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const HideYearDropdown: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation hideYearDropdown />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const TodayButton: StoryFn<
  CalendarSingleProps<DateFrameworkType> & React.RefAttributes<HTMLDivElement>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const today = dateAdapter.today();
  const [selectedDate, setSelectedDate] =
    useState<
      UseCalendarSelectionSingleProps<DateFrameworkType>["selectedDate"]
    >(undefined);
  return (
    <Calendar
      selectionVariant={selectionVariant}
      selectedDate={selectedDate}
      defaultVisibleMonth={dateAdapter.startOf(today, "month")}
      onSelectionChange={(_event, newSelectedDate) =>
        setSelectedDate(newSelectedDate.date)
      }
      {...args}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
        <Divider />
        <Button
          style={{ margin: "var(--salt-spacing-50)" }}
          sentiment="accented"
          appearance="bordered"
          onClick={() => setSelectedDate(today)}
        >
          Today
        </Button>
      </StackLayout>
    </Calendar>
  );
};

function renderDayContents(day: DateFrameworkType) {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  return <>{dateAdapter.format(day, "DD")}</>;
}

export const CustomDayRender: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid getCalendarMonthProps={() => ({ renderDayContents })} />
    </Calendar>
  );
};

export const FadeMonthAnimation: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args} className={"FadeMonthAnimation"}>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid getCalendarMonthProps={() => ({ renderDayContents })} />
    </Calendar>
  );
};

export const MinMaxDate: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const defaultSelectedDate = dateAdapter.today();
  const minDate = dateAdapter.startOf(defaultSelectedDate, "month");
  const maxDate = dateAdapter.endOf(defaultSelectedDate, "month");

  return (
    <Calendar
      {...args}
      selectionVariant={"single"}
      defaultSelectedDate={defaultSelectedDate}
      minDate={minDate}
      maxDate={maxDate}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid getCalendarMonthProps={() => ({ renderDayContents })} />
    </Calendar>
  );
};

export const TwinCalendars: StoryFn<
  CalendarRangeProps<DateFrameworkType> & React.RefAttributes<HTMLDivElement>
> = ({ selectionVariant, ...args }) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const today = dateAdapter.today();
  const [hoveredDate, setHoveredDate] = useState<any | null>(null);
  const handleHoveredDateChange: CalendarProps<DateFrameworkType>["onHoveredDateChange"] =
    (event, newHoveredDate) => {
      setHoveredDate(newHoveredDate);
      args?.onHoveredDateChange?.(event, newHoveredDate);
    };
  const [startVisibleMonth, setStartVisibleMonth] = useState<
    CalendarProps<DateFrameworkType>["defaultVisibleMonth"]
  >(dateAdapter.startOf(today, "month"));
  const [endVisibleMonth, setEndVisibleMonth] = useState<
    CalendarProps<DateFrameworkType>["defaultVisibleMonth"]
  >(dateAdapter.startOf(dateAdapter.add(today, { months: 1 }), "month"));

  const handleStartVisibleMonthChange = useCallback(
    (
      _event: SyntheticEvent,
      newVisibleMonth: CalendarProps<DateFrameworkType>["defaultVisibleMonth"],
    ) => {
      setStartVisibleMonth(newVisibleMonth);
      if (
        newVisibleMonth &&
        endVisibleMonth &&
        dateAdapter.compare(newVisibleMonth, endVisibleMonth) >= 0
      ) {
        setEndVisibleMonth(dateAdapter.add(newVisibleMonth, { months: 1 }));
      }
    },
    [endVisibleMonth],
  );

  const handleEndVisibleMonthChange = useCallback(
    (
      _event: SyntheticEvent,
      newVisibleMonth: CalendarProps<DateFrameworkType>["defaultVisibleMonth"],
    ) => {
      setEndVisibleMonth(newVisibleMonth);
      if (
        newVisibleMonth &&
        startVisibleMonth &&
        dateAdapter.compare(newVisibleMonth, startVisibleMonth) <= 0
      ) {
        setStartVisibleMonth(
          dateAdapter.startOf(
            dateAdapter.subtract(newVisibleMonth, { months: 1 }),
            "month",
          ),
        );
      }
    },
    [startVisibleMonth],
  );

  const [selectedDate, setSelectedDate] = useState<
    UseCalendarSelectionRangeProps<DateFrameworkType>["selectedDate"]
  >(args.defaultSelectedDate);
  const handleSelectionChange: UseCalendarSelectionRangeProps<DateFrameworkType>["onSelectionChange"] =
    (event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
      args?.onSelectionChange?.(event, newSelectedDate);
    };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Calendar
        selectionVariant="range"
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        visibleMonth={startVisibleMonth}
        selectedDate={selectedDate}
        {...args}
        onHoveredDateChange={handleHoveredDateChange}
        onVisibleMonthChange={handleStartVisibleMonthChange}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="range"
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        selectedDate={selectedDate}
        visibleMonth={endVisibleMonth}
        {...args}
        onHoveredDateChange={handleHoveredDateChange}
        onVisibleMonthChange={handleEndVisibleMonthChange}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </Calendar>
    </div>
  );
};

export const WithLocale: StoryFn<typeof Calendar> = (args) => {
  // Include any locales, required by your DateAdapter of choice.
  // Wrap in your own LocalizationProvider to specify the locale or modify the current context
  // <LocalizationProvider DateAdapter={DateAdapter} locale="es-ES"></LocalizationProvider>
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDateFns = dateAdapter.lib === "date-fns";
  dateAdapter.locale = isDateFns ? dateFnsEs : "es-ES";
  return (
    <Calendar {...args}>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};

export const Bordered: StoryFn<typeof Calendar> = (args) => (
  <Calendar {...args}>
    <CalendarNavigation
      MonthDropdownProps={{ bordered: true }}
      YearDropdownProps={{ bordered: true }}
    />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);

import {
  Button,
  Divider,
  Dropdown,
  FormField,
  FormFieldLabel,
  Option,
  StackLayout,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  type CalendarProps,
  type CalendarRangeProps,
  type CalendarSingleProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { type SyntheticEvent, useCallback, useEffect } from "react";
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
      <CalendarGrid />
    </Calendar>
  );
};

export const Single: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const selectedDate = dateAdapter.today();
  return (
    <Calendar
      {...args}
      defaultSelectedDate={selectedDate}
      selectionVariant="single"
    >
      <CalendarNavigation />
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
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      defaultSelectedDate={{ startDate, endDate }}
      selectionVariant="range"
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const Multiselect: StoryFn<typeof Calendar> = ({
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
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
  return (
    <Calendar
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      selectionVariant="multiselect"
      defaultVisibleMonth={defaultVisibleMonth}
      defaultSelectedDate={defaultSelectedDate}
      hideOutOfRangeDates
    >
      <CalendarNavigation />
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
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      defaultSelectedDate={{ startDate, endDate }}
      endDateOffset={endDateOffset}
      selectionVariant="offset"
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const UnselectableDates: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDayUnselectable = (day: ReturnType<typeof dateAdapter.date>) => {
    const dayOfWeek = dateAdapter.getDayOfWeek(day);
    const isWeekend =
      (dateAdapter.lib === "luxon" && (dayOfWeek === 7 || dayOfWeek === 6)) ||
      (dateAdapter.lib !== "luxon" && (dayOfWeek === 0 || dayOfWeek === 6));

    return isWeekend ? "weekends are un-selectable" : false;
  };
  return (
    <Calendar
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      selectionVariant="single"
      isDayUnselectable={isDayUnselectable}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const DisabledDates: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDayDisabled = (day: ReturnType<typeof dateAdapter.date>) => {
    const dayOfWeek = dateAdapter.getDayOfWeek(day);
    const isWeekend =
      (dateAdapter.lib === "luxon" && (dayOfWeek === 7 || dayOfWeek === 6)) ||
      (dateAdapter.lib !== "luxon" && (dayOfWeek === 0 || dayOfWeek === 6));

    return isWeekend ? "Weekends are disabled" : false;
  };
  return (
    <Calendar
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      selectionVariant="single"
      isDayDisabled={isDayDisabled}
    >
      <CalendarNavigation />
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
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      selectionVariant="single"
      isDayHighlighted={isDayHighlighted}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const HideOutOfRangeDates: StoryFn<typeof Calendar> = (args) => {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: story args
    <Calendar {...(args as any)} selectionVariant="single" hideOutOfRangeDates>
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const HideYearDropdown: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation hideYearDropdown />
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
    >(null);
  return (
    <Calendar
      {...args}
      selectionVariant={selectionVariant}
      selectedDate={selectedDate}
      defaultVisibleMonth={dateAdapter.startOf(today, "month")}
      onSelectionChange={(_event, newSelectedDate) =>
        setSelectedDate(newSelectedDate)
      }
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
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
      <CalendarGrid getCalendarMonthProps={() => ({ renderDayContents })} />
    </Calendar>
  );
};

export const FadeMonthAnimation: StoryFn<typeof Calendar> = (args) => {
  return (
    <Calendar {...args} className={"FadeMonthAnimation"}>
      <CalendarNavigation />
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
      <CalendarGrid />
    </Calendar>
  );
};

export const TwinCalendars: StoryFn<
  CalendarRangeProps<DateFrameworkType> & React.RefAttributes<HTMLDivElement>
> = ({
  defaultSelectedDate,
  defaultVisibleMonth,
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();

  const today = dateAdapter.today();
  // biome-ignore lint/suspicious/noExplicitAny: date framework dependent
  const [hoveredDate, setHoveredDate] = useState<any | null>(null);
  const handleHoveredDateChange: CalendarProps<DateFrameworkType>["onHoveredDateChange"] =
    (event, newHoveredDate) => {
      setHoveredDate(newHoveredDate);
      args?.onHoveredDateChange?.(event, newHoveredDate);
    };
  const [startVisibleMonth, setStartVisibleMonth] = useState<
    CalendarProps<DateFrameworkType>["defaultVisibleMonth"]
  >(defaultVisibleMonth ?? dateAdapter.startOf(today, "month"));
  const [endVisibleMonth, setEndVisibleMonth] = useState<
    CalendarProps<DateFrameworkType>["defaultVisibleMonth"]
  >(dateAdapter.add(startVisibleMonth ?? today, { months: 1 }));

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
    [dateAdapter, endVisibleMonth],
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
    [dateAdapter, startVisibleMonth],
  );

  const [selectedDate, setSelectedDate] =
    useState<UseCalendarSelectionRangeProps<DateFrameworkType>["selectedDate"]>(
      defaultSelectedDate,
    );
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
      <CalendarGrid />
    </Calendar>
  );
};

export const SingleWithTimezone: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const timezoneOptions =
    dateAdapter.lib !== "date-fns"
      ? [
          "default",
          "system",
          "UTC",
          "America/New_York",
          "Europe/London",
          "Asia/Shanghai",
          "Asia/Kolkata",
        ]
      : ["default"];
  const [timezone, setTimezone] = useState<string>(timezoneOptions[0]);
  const [iso8601String, setIso8601String] = useState<string>("");
  const [localeDateString, setLocaleDateString] = useState<string>("");
  const [dateString, setDateString] = useState<string>("");

  useEffect(() => {
    setIso8601String("");
    setLocaleDateString("");
    setDateString("");
  }, [timezone]);

  const handleSelectionChange: UseCalendarSelectionSingleProps<DateFrameworkType>["onSelectionChange"] =
    (_e, selection) => {
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const ianaTimezone =
        timezone !== "system" && timezone !== "default" ? timezone : undefined;

      const formatDate = (date) => {
        const iso = date.toISOString();
        const locale = new Intl.DateTimeFormat(undefined, {
          timeZone: systemTimeZone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(date);
        const formatted = new Intl.DateTimeFormat(undefined, {
          timeZone: ianaTimezone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(date);
        return { iso, locale, formatted };
      };

      const formattedDate = formatDate(selection);

      setIso8601String(formattedDate.iso);
      setLocaleDateString(formattedDate.locale);
      setDateString(formattedDate.formatted);
    };

  const handleTimezoneSelect = (_e: SyntheticEvent, selection: string[]) => {
    setTimezone(selection[0]);
  };

  return (
    <StackLayout direction={"row"}>
      <Calendar
        {...args}
        timezone={timezone}
        key={timezone}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
      <StackLayout direction={"column"}>
        <FormField>
          <FormFieldLabel>Select a Timezone</FormFieldLabel>
          <Dropdown
            aria-label="Timezone Dropdown"
            selected={[timezone]}
            onSelectionChange={handleTimezoneSelect}
          >
            {timezoneOptions.map((tz) => (
              <Option key={tz} value={tz}>
                {tz}
              </Option>
            ))}
          </Dropdown>
        </FormField>
        <FormField data-test-id={"iso-date-label"}>
          <FormFieldLabel>ISO 8601 Format</FormFieldLabel> {iso8601String}
        </FormField>
        <FormField data-test-id={"timezone-date-label"}>
          <FormFieldLabel>Date/Time in Timezone {timezone}</FormFieldLabel>
          {dateString}
        </FormField>
        <FormField data-test-id={"locale-date-label"}>
          <FormFieldLabel>Locale Date/Time</FormFieldLabel> {localeDateString}
        </FormField>
      </StackLayout>
    </StackLayout>
  );
};

export const RangeWithTimezone: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const timezoneOptions =
    dateAdapter.lib !== "date-fns"
      ? [
          "default",
          "system",
          "UTC",
          "America/New_York",
          "Europe/London",
          "Asia/Shanghai",
          "Asia/Kolkata",
        ]
      : ["default"];
  const [timezone, setTimezone] = useState<string>(timezoneOptions[0]);
  const [startIso8601String, setStartIso8601String] = useState<string>("");
  const [startLocaleDateString, setStartLocaleDateString] =
    useState<string>("");
  const [startDateString, setStartDateString] = useState<string>("");
  const [startDateError, setStartDateError] = useState<string | undefined>(
    undefined,
  );
  const [endIso8601String, setEndIso8601String] = useState<string>("");
  const [endLocaleDateString, setEndLocaleDateString] = useState<string>("");
  const [endDateString, setEndDateString] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setStartIso8601String("");
    setStartLocaleDateString("");
    setStartDateString("");
    setStartDateError(undefined);
    setEndIso8601String("");
    setEndLocaleDateString("");
    setEndDateString("");
    setEndDateError(undefined);
  }, [timezone]);

  const handleSelectionChange: UseCalendarSelectionRangeProps<DateFrameworkType>["onSelectionChange"] =
    (_e, selection, details) => {
      const { startDate, endDate } = selection;
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const ianaTimezone =
        timezone !== "system" && timezone !== "default" ? timezone : undefined;

      const formatDate = (date) => {
        const iso = date.toISOString();
        const locale = new Intl.DateTimeFormat(undefined, {
          timeZone: systemTimeZone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(date);
        const formatted = new Intl.DateTimeFormat(undefined, {
          timeZone: ianaTimezone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(date);
        return { iso, locale, formatted };
      };

      if (startDate) {
        const start = formatDate(startDate);
        setStartIso8601String(start.iso);
        setStartLocaleDateString(start.locale);
        setStartDateString(start.formatted);
      } else {
        setStartIso8601String("");
        setStartLocaleDateString("");
        setStartDateString("");
      }
      if (endDate) {
        const end = formatDate(endDate);
        setEndIso8601String(end.iso);
        setEndLocaleDateString(end.locale);
        setEndDateString(end.formatted);
      } else {
        setEndIso8601String("");
        setEndLocaleDateString("");
        setEndDateString("");
      }
    };

  const handleTimezoneSelect = (_e: SyntheticEvent, selection: string[]) => {
    setTimezone(selection[0]);
  };

  return (
    <StackLayout direction={"row"}>
      <Calendar
        {...args}
        selectionVariant={"range"}
        timezone={timezone}
        key={timezone}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
      <StackLayout direction={"column"}>
        <FormField>
          <FormFieldLabel>Select a Timezone</FormFieldLabel>
          <Dropdown
            aria-label="Timezone Dropdown"
            selected={[timezone]}
            onSelectionChange={handleTimezoneSelect}
          >
            {timezoneOptions.map((tz) => (
              <Option key={tz} value={tz}>
                {tz}
              </Option>
            ))}
          </Dropdown>
        </FormField>
        <FormField data-test-id={"iso-start-date-label"}>
          <FormFieldLabel>Start ISO 8601 Format</FormFieldLabel>
          {startIso8601String}
        </FormField>
        <FormField data-test-id={"timezone-start-date-label"}>
          <FormFieldLabel>
            Start Date/Time in Timezone {timezone}
          </FormFieldLabel>
          {startDateString}
        </FormField>
        <FormField data-test-id={"locale-start-date-label"}>
          <FormFieldLabel>Start Locale Date/Time</FormFieldLabel>
          {startLocaleDateString}
        </FormField>
        <FormField data-test-id={"iso-end-date-label"}>
          <FormFieldLabel>End ISO 8601 Format</FormFieldLabel>
          {endIso8601String}
        </FormField>
        <FormField data-test-id={"timezone-end-date-label"}>
          <FormFieldLabel>End Date/Time in Timezone {timezone}</FormFieldLabel>
          {endDateString}
        </FormField>
        <FormField data-test-id={"locale-end-date-label"}>
          <FormFieldLabel>End Locale Date/Time</FormFieldLabel>
          {endLocaleDateString}
        </FormField>
      </StackLayout>
    </StackLayout>
  );
};

export const WithTimezoneFromDates: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const timezoneOptions =
    dateAdapter.lib !== "date-fns"
      ? [
          "default",
          "system",
          "UTC",
          "America/New_York",
          "Europe/London",
          "Asia/Shanghai",
          "Asia/Kolkata",
        ]
      : ["default"];
  const [timezone, setTimezone] = useState<string>(timezoneOptions[0]);
  const [iso8601String, setIso8601String] = useState<string>("");
  const [localeDateString, setLocaleDateString] = useState<string>("");
  const [dateString, setDateString] = useState<string>("");

  useEffect(() => {
    setIso8601String("");
    setLocaleDateString("");
    setDateString("");
  }, [timezone]);

  const handleSelectionChange: UseCalendarSelectionSingleProps<DateFrameworkType>["onSelectionChange"] =
    (_e, selection) => {
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const ianaTimezone =
        timezone !== "system" && timezone !== "default" ? timezone : undefined;

      const formatDate = (date) => {
        const iso = date.toISOString();
        const locale = new Intl.DateTimeFormat(undefined, {
          timeZone: systemTimeZone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(date);
        const formatted = new Intl.DateTimeFormat(undefined, {
          timeZone: ianaTimezone,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }).format(date);
        return { iso, locale, formatted };
      };

      const formattedDate = formatDate(selection);

      setIso8601String(formattedDate.iso);
      setLocaleDateString(formattedDate.locale);
      setDateString(formattedDate.formatted);
    };

  const handleTimezoneSelect = (_e: SyntheticEvent, selection: string[]) => {
    setTimezone(selection[0]);
  };

  return (
    <StackLayout direction={"row"}>
      <Calendar
        {...args}
        defaultVisibleMonth={dateAdapter.today(undefined, timezone)}
        defaultSelectedDate={dateAdapter.today(undefined, timezone)}
        key={timezone}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
      <StackLayout direction={"column"}>
        <Dropdown
          aria-label="Timezone Dropdown"
          selected={[timezone]}
          onSelectionChange={handleTimezoneSelect}
        >
          {timezoneOptions.map((tz) => (
            <Option key={tz} value={tz}>
              {tz}
            </Option>
          ))}
        </Dropdown>
        <FormField data-test-id={"iso-date-label"}>
          <FormFieldLabel>ISO 8601 Format</FormFieldLabel> {iso8601String}
        </FormField>
        <FormField data-test-id={"timezone-date-label"}>
          <FormFieldLabel>Date/Time in Timezone {timezone}</FormFieldLabel>
          {dateString}
        </FormField>
        <FormField data-test-id={"locale-date-label"}>
          <FormFieldLabel>Locale Date/Time</FormFieldLabel> {localeDateString}
        </FormField>
      </StackLayout>
    </StackLayout>
  );
};

export const Bordered: StoryFn<typeof Calendar> = (args) => (
  <Calendar {...args}>
    <CalendarNavigation
      MonthDropdownProps={{ bordered: true }}
      YearDropdownProps={{ bordered: true }}
    />
    <CalendarGrid />
  </Calendar>
);

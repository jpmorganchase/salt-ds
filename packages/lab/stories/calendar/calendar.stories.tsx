import {
  Button,
  Divider,
  Dropdown,
  FormField,
  FormFieldLabel,
  GridItem,
  GridLayout,
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
  type renderCalendarDayProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  useLocalization,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { clsx } from "clsx";
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import "./calendar.stories.css";

import "dayjs/locale/es"; // Import the Spanish locale
import { es as dateFnsEs } from "date-fns/locale";
import "moment/dist/locale/es";
import { withDateMock } from ".storybook/decorators/withDateMock";

export default {
  title: "Lab/Calendar",
  component: Calendar,
  decorators: [withDateMock],
  parameters: {
    actions: { disable: true }, // Disable actions for all stories in this file
  },
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

export const CustomDayRendering: StoryFn<typeof Calendar> = (args) => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();

  function renderDayButton({
    className,
    date,
    status,
    ...rest
  }: renderCalendarDayProps<DateFrameworkType>): ReactElement {
    return (
      <button
        {...rest}
        className={clsx([{ buttonWithDot: !status.outOfRange }, className])}
      >
        <span className={clsx({ dot: !status.outOfRange })}>
          {dateAdapter.format(date, "D")}
        </span>
        {status.today ? <span className={"today"} /> : null}
      </button>
    );
  }

  return (
    <Calendar hideOutOfRangeDates {...args}>
      <CalendarNavigation />
      <CalendarGrid CalendarDayProps={{ render: renderDayButton }} />
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
  const [focusedDate, setFocusedDate] = useState<DateFrameworkType | null>(
    dateAdapter.startOf(startVisibleMonth, "month"),
  );

  const handleStartVisibleMonthChange = useCallback(
    (
      _event: SyntheticEvent | null,
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
      _event: SyntheticEvent | null,
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

  const handleFocusedDateChange: CalendarProps<DateFrameworkType>["onFocusedDateChange"] =
    (_event, newFocusedDate) => {
      setFocusedDate(newFocusedDate);
    };
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Calendar
        selectionVariant="range"
        focusedDate={
          dateAdapter.compare(
            focusedDate,
            dateAdapter.startOf(endVisibleMonth, "month"),
          ) < 0
            ? focusedDate
            : null
        }
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        visibleMonth={startVisibleMonth}
        selectedDate={selectedDate}
        {...args}
        onFocusedDateChange={handleFocusedDateChange}
        onHoveredDateChange={handleHoveredDateChange}
        onVisibleMonthChange={handleStartVisibleMonthChange}
        onSelectionChange={handleSelectionChange}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="range"
        focusedDate={
          dateAdapter.compare(
            focusedDate,
            dateAdapter.startOf(endVisibleMonth, "month"),
          ) >= 0
            ? focusedDate
            : null
        }
        hideOutOfRangeDates
        hoveredDate={hoveredDate}
        selectedDate={selectedDate}
        visibleMonth={endVisibleMonth}
        {...args}
        onFocusedDateChange={handleFocusedDateChange}
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
    <FormField style={{ width: "180px" }}>
      <FormFieldLabel>ES locale calendar</FormFieldLabel>
      <Calendar {...args}>
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
    </FormField>
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
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    timezoneOptions[0],
  );
  const [currentTimezone, setCurrentTimezone] = useState<string>("");
  const [iso8601String, setIso8601String] = useState<string>("");
  const [localeDateString, setLocaleDateString] = useState<string>("");
  const [dateString, setDateString] = useState<string>("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset related state when timezone changes
  useEffect(() => {
    setIso8601String("");
    setLocaleDateString("");
    setDateString("");
  }, [selectedTimezone]);

  const handleSelectionChange: UseCalendarSelectionSingleProps<DateFrameworkType>["onSelectionChange"] =
    (_event, selection) => {
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const ianaTimezone =
        selectedTimezone !== "system" && selectedTimezone !== "default"
          ? selectedTimezone
          : undefined;

      const formatDate = (date: DateFrameworkType) => {
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

      const jsDate =
        dateAdapter.lib === "luxon"
          ? selection.toJSDate()
          : dateAdapter.lib === "moment"
            ? selection.toDate()
            : selection;
      const formattedDate = formatDate(jsDate);

      setCurrentTimezone(dateAdapter.getTimezone(selection));

      setIso8601String(formattedDate.iso);
      setLocaleDateString(formattedDate.locale);
      setDateString(formattedDate.formatted);
    };

  const handleTimezoneSelect = (_e: SyntheticEvent, selection: string[]) => {
    setSelectedTimezone(selection[0]);
  };

  return (
    <GridLayout gap={1}>
      <GridItem colSpan={6}>
        <Calendar
          {...args}
          selectionVariant={"single"}
          timezone={selectedTimezone}
          key={selectedTimezone}
          onSelectionChange={handleSelectionChange}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>
      </GridItem>
      <GridItem colSpan={6}>
        <StackLayout direction={"column"}>
          <FormField>
            <FormFieldLabel>Select a Timezone</FormFieldLabel>
            <Dropdown
              aria-label="timezone dropdown"
              selected={[selectedTimezone]}
              onSelectionChange={handleTimezoneSelect}
            >
              {timezoneOptions.map((tz) => (
                <Option key={tz} value={tz}>
                  {tz}
                </Option>
              ))}
            </Dropdown>
          </FormField>
          <FormField>
            <FormFieldLabel>Current timezone</FormFieldLabel>
            <span data-testid={"timezone"}>
              {currentTimezone?.length ? currentTimezone : "-"}
            </span>
          </FormField>
          <FormField>
            <FormFieldLabel>ISO8601 format</FormFieldLabel>
            <span data-testid={"iso-date-label"}>
              {iso8601String?.length ? iso8601String : "-"}
            </span>
          </FormField>
          <FormField>
            <FormFieldLabel>Date in current timezone</FormFieldLabel>
            <span data-testid={"timezone-date-label"}>
              {dateString?.length ? dateString : "-"}
            </span>
          </FormField>
          <FormField>
            <FormFieldLabel>Date in current locale</FormFieldLabel>
            <span data-testid={"locale-date-label"}>
              {localeDateString?.length ? localeDateString : "-"}
            </span>
          </FormField>
        </StackLayout>
      </GridItem>
    </GridLayout>
  );
};

export const RangeWithTimezone: StoryFn<
  CalendarRangeProps<DateFrameworkType>
> = (args) => {
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
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    timezoneOptions[0],
  );
  const [currentTimezone, setCurrentTimezone] = useState<string>("");
  const [startIso8601String, setStartIso8601String] = useState<string>("");
  const [startLocaleDateString, setStartLocaleDateString] =
    useState<string>("");
  const [startDateString, setStartDateString] = useState<string>("");
  const [endIso8601String, setEndIso8601String] = useState<string>("");
  const [endLocaleDateString, setEndLocaleDateString] = useState<string>("");
  const [endDateString, setEndDateString] = useState<string>("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset related state when timezone changes
  useEffect(() => {
    setCurrentTimezone("");
    setStartIso8601String("");
    setStartLocaleDateString("");
    setStartDateString("");
    setEndIso8601String("");
    setEndLocaleDateString("");
    setEndDateString("");
  }, [selectedTimezone]);

  const handleSelectionChange: UseCalendarSelectionRangeProps<DateFrameworkType>["onSelectionChange"] =
    (_event, selection) => {
      const { startDate, endDate } = selection;
      const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const ianaTimezone =
        selectedTimezone !== "system" && selectedTimezone !== "default"
          ? selectedTimezone
          : undefined;

      const formatDate = (date: DateFrameworkType) => {
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

      const startJSDate =
        dateAdapter.lib === "luxon"
          ? startDate.toJSDate()
          : dateAdapter.lib === "moment"
            ? startDate.toDate()
            : startDate;
      const start = formatDate(startJSDate);
      setStartIso8601String(start.iso);
      setStartLocaleDateString(start.locale);
      setStartDateString(start.formatted);

      if (endDate) {
        const endJSDate =
          dateAdapter.lib === "luxon"
            ? endDate.toJSDate()
            : dateAdapter.lib === "moment"
              ? endDate.toDate()
              : endDate;
        const end = formatDate(endJSDate);
        setEndIso8601String(end.iso);
        setEndLocaleDateString(end.locale);
        setEndDateString(end.formatted);
      }
    };

  const handleTimezoneSelect = (
    _event: SyntheticEvent,
    selection: string[],
  ) => {
    setSelectedTimezone(selection[0]);
  };

  return (
    <GridLayout gap={1}>
      <GridItem colSpan={6}>
        <Calendar
          {...args}
          selectionVariant={"range"}
          timezone={selectedTimezone}
          key={selectedTimezone}
          onSelectionChange={handleSelectionChange}
        >
          <CalendarNavigation />
          <CalendarGrid />
        </Calendar>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Select a Timezone</FormFieldLabel>
          <Dropdown
            aria-label="timezone dropdown"
            selected={[selectedTimezone]}
            onSelectionChange={handleTimezoneSelect}
            style={{ minWidth: "120px", width: "min-content" }}
          >
            {timezoneOptions.map((tz) => (
              <Option key={tz} value={tz}>
                {tz}
              </Option>
            ))}
          </Dropdown>
        </FormField>
      </GridItem>
      <GridItem colSpan={12}>
        <FormField>
          <FormFieldLabel>Current timezone</FormFieldLabel>
          <span data-testid={"timezone"}>
            {currentTimezone?.length ? currentTimezone : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Start date in ISO8601 format</FormFieldLabel>
          <span data-testid={"iso-start-date-label"}>
            {startIso8601String?.length ? startIso8601String : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>End date in ISO8601 format</FormFieldLabel>
          <span data-testid={"iso-end-date-label"}>
            {endIso8601String?.length ? endIso8601String : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Start date in current timezone</FormFieldLabel>
          <span data-testid={"timezone-start-date-label"}>
            {startDateString?.length ? startDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>End date in current timezone</FormFieldLabel>
          <span data-testid={"timezone-end-date-label"}>
            {endDateString?.length ? endDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>Start date in current locale</FormFieldLabel>
          <span data-testid={"locale-start-date-label"}>
            {startLocaleDateString?.length ? startLocaleDateString : "-"}
          </span>
        </FormField>
      </GridItem>
      <GridItem colSpan={6}>
        <FormField>
          <FormFieldLabel>End date in current locale</FormFieldLabel>
          <span data-testid={"locale-end-date-label"}>
            {endLocaleDateString?.length ? endLocaleDateString : "-"}
          </span>
        </FormField>
      </GridItem>
    </GridLayout>
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

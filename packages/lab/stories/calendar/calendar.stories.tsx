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
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  type CalendarMultiselectOffsetProps,
  type CalendarMultiselectRangeProps,
  type CalendarMultiselectSingleProps,
  CalendarNavigation,
  type CalendarOffsetProps,
  type CalendarRangeProps,
  type CalendarSingleProps,
  type DateRangeSelection,
  type renderCalendarDayProps,
  type SingleDateSelection,
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
  const { dateAdapter } = useLocalization();
  return (
    <Calendar
      {...(args as any)}
      selectionVariant={"single"}
      defaultSelectedDate={dateAdapter.today()}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const Single: StoryFn<React.FC<CalendarSingleProps>> = (args) => {
  const { dateAdapter } = useLocalization();
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

export const Grid: StoryFn<React.FC<CalendarSingleProps>> = (args) => {
  const { dateAdapter } = useLocalization();
  const selectedDate = dateAdapter.today();
  return (
    <Calendar
      {...args}
      defaultSelectedDate={selectedDate}
      hideOutOfRangeDates
      numberOfVisibleMonths={12}
      selectionVariant="single"
    >
      <CalendarNavigation />
      <CalendarGrid columns={4} />
    </Calendar>
  );
};

export const SingleControlled: StoryFn<React.FC<CalendarSingleProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<
    CalendarSingleProps["selectedDate"]
  >(dateAdapter.today());
  const handleSelectionChange: CalendarSingleProps["onSelectionChange"] = (
    _event,
    newSelectedDate,
  ) => {
    if (
      selectedDate &&
      newSelectedDate &&
      dateAdapter.isSame(selectedDate, newSelectedDate, "day")
    ) {
      setSelectedDate(null);
    } else {
      setSelectedDate(newSelectedDate);
    }
  };

  return (
    <Calendar
      {...args}
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      select={(previousSelectedDate, newDate) => {
        if (!previousSelectedDate) {
          return newDate;
        }
        return dateAdapter.isSame(previousSelectedDate, newDate, "day")
          ? null
          : newDate;
      }}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};

export const SingleMultiselect: StoryFn<
  React.FC<CalendarMultiselectSingleProps>
> = (args) => {
  const { dateAdapter } = useLocalization();
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
      selectionVariant="single"
      multiselect={true}
      defaultVisibleMonth={defaultVisibleMonth}
      defaultSelectedDate={defaultSelectedDate}
      hideOutOfRangeDates
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

function selectMultiselectSingle(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: SingleDateSelection[],
  newDate: DateFrameworkType,
) {
  const newSelection = previousSelectedDate.filter(
    (previousSingleDate) =>
      !dateAdapter.isSame(previousSingleDate, newDate, "day"),
  );
  if (previousSelectedDate.length !== newSelection.length) {
    return newSelection;
  }
  return [...previousSelectedDate, newDate];
}

export const SingleMultiselectControlled: StoryFn<
  React.FC<CalendarMultiselectSingleProps>
> = (args) => {
  const { dateAdapter } = useLocalization();
  const initialVisibleMonth = dateAdapter.parse(
    "01/01/2024",
    "DD/MM/YYYY",
  ).date;
  const initialSelectedDate = [
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

  const [visibleMonth, setVisibleMonth] =
    useState<CalendarMultiselectSingleProps["visibleMonth"]>(
      initialVisibleMonth,
    );
  const [selectedDate, setSelectedDate] =
    useState<CalendarMultiselectSingleProps["selectedDate"]>(
      initialSelectedDate,
    );
  const handleSelectionChange: CalendarMultiselectSingleProps["onSelectionChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };
  const handleVisibleMonthChange: CalendarMultiselectSingleProps["onVisibleMonthChange"] =
    (_event, newVisibleMonth) => {
      setVisibleMonth(newVisibleMonth);
    };

  return (
    <Calendar
      {...(args as any)}
      selectionVariant={"single"}
      multiselect={true}
      visibleMonth={visibleMonth}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      onVisibleMonthChange={handleVisibleMonthChange}
      hideOutOfRangeDates
      select={(
        previousSelectedDate: SingleDateSelection[],
        newDate: SingleDateSelection,
      ) => selectMultiselectSingle(dateAdapter, previousSelectedDate, newDate)}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};

function selectDateRange(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: DateRangeSelection,
  newDate: DateFrameworkType,
): DateRangeSelection {
  const isSelectedAlready =
    !!previousSelectedDate?.startDate && !!previousSelectedDate?.endDate;
  if (
    isSelectedAlready &&
    previousSelectedDate?.startDate &&
    dateAdapter.compare(newDate, previousSelectedDate.startDate) >= 0 &&
    previousSelectedDate?.endDate &&
    dateAdapter.compare(newDate, previousSelectedDate.endDate) <= 0
  ) {
    return { startDate: null, endDate: null };
  }
  if (previousSelectedDate?.startDate && previousSelectedDate?.endDate) {
    return {
      startDate: newDate,
    };
  }
  if (
    previousSelectedDate?.startDate &&
    dateAdapter.compare(newDate, previousSelectedDate?.startDate) >= 0
  ) {
    return {
      ...previousSelectedDate,
      endDate: newDate,
    };
  }
  return {
    startDate: newDate,
  };
}

export const Range: StoryFn<React.FC<CalendarRangeProps>> = (args) => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 4 });
  return (
    <Calendar
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      selectionVariant={"range"}
      defaultSelectedDate={{ startDate, endDate }}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const RangeControlled: StoryFn<React.FC<CalendarRangeProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<
    CalendarRangeProps["selectedDate"]
  >({
    startDate: dateAdapter.today(),
    endDate: dateAdapter.add(dateAdapter.today(), { days: 4 }),
  });
  const handleSelectionChange: CalendarRangeProps["onSelectionChange"] = (
    _event,
    newSelectedDate,
  ) => {
    setSelectedDate(newSelectedDate);
  };

  return (
    <Calendar
      {...args}
      selectionVariant={"range"}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      select={(
        previousSelectedDate: DateRangeSelection,
        newDate: DateFrameworkType,
      ): DateRangeSelection => {
        return selectDateRange(dateAdapter, previousSelectedDate, newDate);
      }}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};

export const RangeMultiselect: StoryFn<
  React.FC<CalendarMultiselectRangeProps>
> = (args) => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 4 });
  return (
    <Calendar
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      defaultSelectedDate={[{ startDate, endDate }]}
      selectionVariant="range"
      multiselect={true}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

function selectMultiselectRange(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: DateRangeSelection[],
  newDate: DateFrameworkType,
): DateRangeSelection[] {
  const lastRange = previousSelectedDate.length
    ? previousSelectedDate[previousSelectedDate.length - 1]
    : undefined;
  const isIncompleteRange = !lastRange?.endDate;

  if (isIncompleteRange) {
    const isNewSelection = previousSelectedDate.length === 0;
    if (isNewSelection) {
      return [{ startDate: newDate }];
    }
    const completeDateRange = selectDateRange(
      dateAdapter,
      previousSelectedDate[previousSelectedDate.length - 1],
      newDate,
    );
    return [
      ...previousSelectedDate.slice(0, -1),
      completeDateRange,
    ] as DateRangeSelection[];
  }

  const newSelection = previousSelectedDate.filter((previousDateRange) => {
    return !(
      previousDateRange?.startDate &&
      previousDateRange?.endDate &&
      dateAdapter.compare(newDate, previousDateRange?.startDate) >= 0 &&
      dateAdapter.compare(newDate, previousDateRange?.endDate) <= 0
    );
  });
  if (previousSelectedDate.length !== newSelection.length) {
    return newSelection;
  }
  return [...previousSelectedDate, { startDate: newDate }];
}

export const RangeMultiselectControlled: StoryFn<
  React.FC<CalendarMultiselectRangeProps>
> = (args) => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<
    CalendarMultiselectRangeProps["selectedDate"]
  >([
    {
      startDate: dateAdapter.today(),
      endDate: dateAdapter.add(dateAdapter.today(), { days: 4 }),
    },
  ]);
  const handleSelectionChange: CalendarMultiselectRangeProps["onSelectionChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <Calendar
      {...args}
      selectionVariant={"range"}
      multiselect={true}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      select={(
        previousSelectedDate: DateRangeSelection[],
        newDate: DateFrameworkType,
      ) => selectMultiselectRange(dateAdapter, previousSelectedDate, newDate)}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};

export const Offset: StoryFn<React.FC<CalendarOffsetProps>> = (args) => {
  const { dateAdapter } = useLocalization();
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

function selectOffset(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: DateRangeSelection,
  newDate: DateFrameworkType,
  endDateOffset: CalendarOffsetProps["endDateOffset"],
) {
  if (
    previousSelectedDate?.startDate &&
    previousSelectedDate?.endDate &&
    dateAdapter.compare(newDate, previousSelectedDate.startDate) >= 0 &&
    dateAdapter.compare(newDate, previousSelectedDate.endDate) <= 0
  ) {
    return { startDate: null, endDate: null };
  }
  return {
    startDate: newDate,
    endDate: endDateOffset?.(newDate),
  };
}

export const OffsetControlled: StoryFn<React.FC<CalendarOffsetProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();
  const endDateOffset = (date: ReturnType<typeof dateAdapter.date>) =>
    dateAdapter.add(date, { days: 4 });
  const [selectedDate, setSelectedDate] = useState<
    CalendarOffsetProps["selectedDate"]
  >({
    startDate: dateAdapter.today(),
    endDate: endDateOffset(dateAdapter.today()),
  });
  const handleSelectionChange: CalendarOffsetProps["onSelectionChange"] = (
    _event,
    newSelectedDate,
  ) => {
    setSelectedDate(newSelectedDate);
  };

  return (
    <Calendar
      {...args}
      selectionVariant={"offset"}
      selectedDate={selectedDate}
      endDateOffset={endDateOffset}
      onSelectionChange={handleSelectionChange}
      select={(
        previousSelectedDate: DateRangeSelection,
        newDate: DateFrameworkType,
      ): DateRangeSelection => {
        return selectOffset(
          dateAdapter,
          previousSelectedDate,
          newDate,
          endDateOffset,
        );
      }}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};

function selectMultiselectOffset(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: DateRangeSelection[],
  newDate: DateFrameworkType,
  endDateOffset: CalendarOffsetProps["endDateOffset"],
): DateRangeSelection[] {
  if (previousSelectedDate.length === 0) {
    return [{ startDate: newDate, endDate: endDateOffset?.(newDate) }];
  }

  const newSelection = previousSelectedDate.filter((previousOffset) => {
    return !(
      previousOffset?.startDate &&
      dateAdapter.compare(newDate, previousOffset?.startDate) >= 0 &&
      previousOffset?.endDate &&
      dateAdapter.compare(newDate, previousOffset?.endDate) <= 0
    );
  });
  if (previousSelectedDate.length !== newSelection.length) {
    return newSelection;
  }
  return [
    ...previousSelectedDate,
    { startDate: newDate, endDate: endDateOffset?.(newDate) },
  ];
}

export const OffsetMultiselect: StoryFn<
  React.FC<CalendarMultiselectOffsetProps>
> = (args) => {
  const { dateAdapter } = useLocalization();
  const endDateOffset = (date: ReturnType<typeof dateAdapter.date>) =>
    dateAdapter.add(date, { days: 4 });
  const startDate = dateAdapter.today();
  const endDate = endDateOffset(startDate);
  return (
    <Calendar
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      defaultSelectedDate={[{ startDate, endDate }]}
      endDateOffset={endDateOffset}
      selectionVariant="offset"
      multiselect={true}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const OffsetMultiselectControlled: StoryFn<
  React.FC<CalendarMultiselectOffsetProps>
> = (args) => {
  const { dateAdapter } = useLocalization();
  const endDateOffset = (date: ReturnType<typeof dateAdapter.date>) =>
    dateAdapter.add(date, { days: 4 });
  const [selectedDate, setSelectedDate] = useState<
    CalendarMultiselectOffsetProps["selectedDate"]
  >([
    {
      startDate: dateAdapter.today(),
      endDate: endDateOffset(dateAdapter.today()),
    },
  ]);
  const handleSelectionChange: CalendarMultiselectOffsetProps["onSelectionChange"] =
    (_event, newSelectedDate) => {
      setSelectedDate(newSelectedDate);
    };

  return (
    <Calendar
      {...args}
      selectionVariant={"offset"}
      endDateOffset={endDateOffset}
      multiselect={true}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
      select={(
        previousSelectedDate: DateRangeSelection[],
        newDate: DateFrameworkType,
      ) => {
        return selectMultiselectOffset(
          dateAdapter,
          previousSelectedDate,
          newDate,
          endDateOffset,
        );
      }}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
      </StackLayout>
    </Calendar>
  );
};

export const UnselectableDates: StoryFn<React.FC<CalendarSingleProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();
  const isDayUnselectable = (day: ReturnType<typeof dateAdapter.date>) => {
    const dayOfWeek = dateAdapter.getDayOfWeek(day);
    const isWeekend =
      (dateAdapter.lib === "luxon" && (dayOfWeek === 7 || dayOfWeek === 6)) ||
      (dateAdapter.lib !== "luxon" && (dayOfWeek === 0 || dayOfWeek === 6));

    return isWeekend ? "Weekends are un-selectable" : false;
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

export const HighlightedDates: StoryFn<React.FC<CalendarSingleProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();
  const isDayHighlighted = (day: ReturnType<typeof dateAdapter.date>) => {
    const startOfMonth = dateAdapter.startOf(day, "month");
    return dateAdapter.isSame(
      dateAdapter.add(startOfMonth, { days: 7 }),
      day,
      "day",
    )
      ? "Start of month reminder"
      : false;
  };
  return (
    <Calendar
      // biome-ignore lint/suspicious/noExplicitAny: story args
      {...(args as any)}
      selectionVariant="range"
      isDayHighlighted={isDayHighlighted}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const HideOutOfRangeDates: StoryFn<React.FC<CalendarSingleProps>> = (
  args,
) => {
  return (
    // biome-ignore lint/suspicious/noExplicitAny: story args
    <Calendar {...(args as any)} selectionVariant="single" hideOutOfRangeDates>
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};

export const HideYearDropdown: StoryFn<React.FC<CalendarSingleProps>> = (
  args,
) => {
  return (
    <Calendar {...args}>
      <CalendarNavigation hideYearDropdown />
      <CalendarGrid />
    </Calendar>
  );
};

export const TodayButton: StoryFn<React.FC<CalendarSingleProps>> = ({
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization();
  const today = dateAdapter.today();
  const [selectedDate, setSelectedDate] =
    useState<CalendarSingleProps["selectedDate"]>(null);
  const handleSelectionChange: CalendarSingleProps["onSelectionChange"] = (
    _event,
    newSelectedDate,
  ) => {
    setSelectedDate(newSelectedDate);
  };

  return (
    <Calendar
      {...args}
      selectionVariant={selectionVariant}
      selectedDate={selectedDate}
      defaultVisibleMonth={dateAdapter.startOf(today, "month")}
      onSelectionChange={handleSelectionChange}
    >
      <StackLayout gap={0}>
        <CalendarNavigation />
        <CalendarGrid />
        <Divider />
        <Button
          aria-label={`Change Date, ${dateAdapter.format(today, "dddd DD MMMM YYYY")}`}
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

export const CustomDayRendering: StoryFn<React.FC<CalendarSingleProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();

  function renderDayButton({
    className,
    date,
    status,
    ...rest
  }: renderCalendarDayProps): ReactElement {
    return (
      <button
        {...rest}
        className={clsx([
          {
            buttonWithDot: !status.outOfRange,
            today: status.today,
          },
          className,
        ])}
      >
        <span className={clsx({ dot: !status.outOfRange })}>
          {dateAdapter.format(date, "D")}
        </span>
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

export const MinMaxDate: StoryFn<React.FC<CalendarSingleProps>> = (args) => {
  const { dateAdapter } = useLocalization();
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

export const TwinCalendars: StoryFn<React.FC<CalendarRangeProps>> = ({
  defaultSelectedDate = { startDate: undefined, endDate: undefined },
  defaultVisibleMonth,
  selectionVariant,
  ...args
}) => {
  const { dateAdapter } = useLocalization();

  const today = dateAdapter.today();
  const [hoveredDate, setHoveredDate] = useState<DateFrameworkType | null>(
    null,
  );
  const handleHoveredDateChange: CalendarRangeProps["onHoveredDateChange"] = (
    _event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
    args?.onHoveredDateChange?.(_event, newHoveredDate);
  };
  const [startVisibleMonth, setStartVisibleMonth] = useState<
    CalendarRangeProps["defaultVisibleMonth"]
  >(defaultVisibleMonth ?? dateAdapter.startOf(today, "month"));
  const [endVisibleMonth, setEndVisibleMonth] = useState<
    CalendarRangeProps["defaultVisibleMonth"]
  >(dateAdapter.add(startVisibleMonth ?? today, { months: 1 }));
  const [focusedDate, setFocusedDate] = useState<DateFrameworkType | null>(
    startVisibleMonth ? dateAdapter.startOf(startVisibleMonth, "month") : null,
  );

  const handleStartVisibleMonthChange = useCallback(
    (
      _event: SyntheticEvent | null,
      newVisibleMonth: CalendarRangeProps["defaultVisibleMonth"],
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
      newVisibleMonth: CalendarRangeProps["defaultVisibleMonth"],
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
    useState<CalendarRangeProps["selectedDate"]>(defaultSelectedDate);
  const handleSelectionChange: CalendarRangeProps["onSelectionChange"] = (
    event,
    newSelectedDate,
  ) => {
    setSelectedDate(newSelectedDate);
    args?.onSelectionChange?.(event, newSelectedDate);
  };

  const handleFocusedDateChange: CalendarRangeProps["onFocusedDateChange"] = (
    _event,
    newFocusedDate,
  ) => {
    setFocusedDate(newFocusedDate);
  };

  return (
    <div
      role="region"
      aria-label="Twin Calendar example"
      style={{ display: "flex", gap: 16 }}
    >
      {/* biome-ignore lint/a11y/useValidAriaRole: composed calendar component does not need the role set */}
      <Calendar
        selectionVariant="range"
        focusedDate={
          focusedDate &&
          endVisibleMonth &&
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
        role={undefined}
      >
        <CalendarNavigation
          MonthDropdownProps={{
            "aria-label": "Select month first calendar",
          }}
          PreviousButtonProps={{
            "aria-label": "Previous month first calendar",
          }}
          NextButtonProps={{ "aria-label": "Next month first calendar" }}
          YearDropdownProps={{
            "aria-label": "Select year first calendar",
          }}
        />
        <CalendarGrid />
      </Calendar>
      {/* biome-ignore lint/a11y/useValidAriaRole: composed calendar component does not need the role set */}
      <Calendar
        selectionVariant="range"
        focusedDate={
          focusedDate &&
          endVisibleMonth &&
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
        role={undefined}
      >
        <CalendarNavigation
          MonthDropdownProps={{
            "aria-label": "Select month second calendar",
          }}
          PreviousButtonProps={{
            "aria-label": "Previous month second calendar",
          }}
          NextButtonProps={{ "aria-label": "Next month second calendar" }}
          YearDropdownProps={{
            "aria-label": "Select year second calendar",
          }}
        />
        <CalendarGrid />
      </Calendar>
    </div>
  );
};

export const WithLocale: StoryFn<React.FC<CalendarSingleProps>> = (args) => {
  // Include any locales, required by your DateAdapter of choice.
  // Wrap in your own LocalizationProvider to specify the locale or modify the current context
  // <LocalizationProvider DateAdapter={DateAdapter} locale="es-ES"></LocalizationProvider>
  const { dateAdapter } = useLocalization();
  const isDateFns = dateAdapter.lib === "date-fns";
  dateAdapter.locale = isDateFns ? dateFnsEs : "es-ES";
  return (
    <FormField style={{ width: "180px" }}>
      <FormFieldLabel>ES locale calendar</FormFieldLabel>
      <Calendar lang="es" {...args}>
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
    </FormField>
  );
};

export const SingleWithTimezone: StoryFn<React.FC<CalendarSingleProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();
  const timezoneOptions = [
    "default",
    "system",
    "UTC",
    "America/New_York",
    "Europe/London",
    "Asia/Shanghai",
    "Asia/Kolkata",
  ];
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

  const handleSelectionChange: CalendarSingleProps["onSelectionChange"] = (
    _event,
    selection,
  ) => {
    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ianaTimezone =
      selectedTimezone !== "system" && selectedTimezone !== "default"
        ? selectedTimezone
        : undefined;

    const formatDate = (date: DateFrameworkType) => {
      const jsDate = dateAdapter.toJSDate(date);
      const iso = jsDate.toISOString();
      const locale = new Intl.DateTimeFormat(undefined, {
        timeZone: systemTimeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      const formatted = new Intl.DateTimeFormat(undefined, {
        timeZone: ianaTimezone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      return { iso, locale, formatted };
    };

    setCurrentTimezone(selection ? dateAdapter.getTimezone(selection) : "");

    const formattedDate = selection ? formatDate(selection) : null;
    setIso8601String(formattedDate?.iso ?? "");
    setLocaleDateString(formattedDate?.locale ?? "");
    setDateString(formattedDate?.formatted ?? "");
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

export const RangeWithTimezone: StoryFn<React.FC<CalendarRangeProps>> = (
  args,
) => {
  const { dateAdapter } = useLocalization();
  const timezoneOptions = [
    "default",
    "system",
    "UTC",
    "America/New_York",
    "Europe/London",
    "Asia/Shanghai",
    "Asia/Kolkata",
  ];
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

  const handleSelectionChange: CalendarRangeProps["onSelectionChange"] = (
    _event,
    selection,
  ) => {
    const { startDate, endDate } = selection;
    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ianaTimezone =
      selectedTimezone !== "system" && selectedTimezone !== "default"
        ? selectedTimezone
        : undefined;

    const formatDate = (date: DateFrameworkType) => {
      const jsDate = dateAdapter.toJSDate(date);
      const iso = jsDate.toISOString();
      const locale = new Intl.DateTimeFormat(undefined, {
        timeZone: systemTimeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      const formatted = new Intl.DateTimeFormat(undefined, {
        timeZone: ianaTimezone,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(jsDate);
      return { iso, locale, formatted };
    };

    const start = startDate ? formatDate(startDate) : null;
    setStartIso8601String(start?.iso ?? "");
    setStartLocaleDateString(start?.locale ?? "");
    setStartDateString(start?.formatted ?? "");

    if (endDate) {
      const end = formatDate(endDate);
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

export const Bordered: StoryFn<React.FC<CalendarSingleProps>> = (args) => (
  <Calendar {...args}>
    <CalendarNavigation
      MonthDropdownProps={{ bordered: true }}
      YearDropdownProps={{ bordered: true }}
    />
    <CalendarGrid />
  </Calendar>
);

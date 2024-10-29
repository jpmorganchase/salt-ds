import {
  AdapterMoment,
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

const testLocale = "en-GB";

export default {
  title: "Lab/Calendar/QA",
  component: Calendar,
  locale: testLocale,
};

const dateAdapter = new AdapterMoment();

export const AllExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer
    cols={4}
    itemPadding={1}
    height={3410}
    width={1050}
    itemWidthAuto
    transposeDensity
    vertical
  >
    <Calendar
      selectionVariant="single"
      selectedDate={dateAdapter.parse("2024-04-02", "YYYY-MM-DD").date}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
    <Calendar
      selectionVariant="range"
      selectedDate={{
        startDate: dateAdapter.parse("2024-04-02", "YYYY-MM-DD").date,
        endDate: dateAdapter.parse("2024-04-04", "YYYY-MM-DD").date,
      }}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
    <Calendar
      selectionVariant="offset"
      selectedDate={{
        startDate: dateAdapter.parse("2024-04-02", "YYYY-MM-DD").date,
        endDate: dateAdapter.parse("2024-04-04", "YYYY-MM-DD").date,
      }}
    >
      <CalendarNavigation />
    </Calendar>
    <Calendar
      selectionVariant="multiselect"
      selectedDate={[
        dateAdapter.parse("2024-04-02", "YYYY-MM-DD").date,
        dateAdapter.parse("2024-04-04", "YYYY-MM-DD").date,
      ]}
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
    <Calendar
      selectionVariant="multiselect"
      selectedDate={[
        dateAdapter.parse("2024-04-02", "YYYY-MM-DD").date,
        dateAdapter.parse("2024-04-04", "YYYY-MM-DD").date,
      ]}
    >
      <CalendarNavigation hideYearDropdown />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
    <Calendar
      selectionVariant="multiselect"
      selectedDate={[
        dateAdapter.parse("2024-04-02", "YYYY-MM-DD").date,
        dateAdapter.parse("2024-04-04", "YYYY-MM-DD").date,
      ]}
    >
      <CalendarNavigation
        MonthDropdownProps={{ bordered: true }}
        YearDropdownProps={{ bordered: true }}
      />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
  modes: {
    theme: {
      themeNext: "disable",
    },
    themeNext: {
      themeNext: "enable",
      corner: "rounded",
      accent: "teal",
      // Ignore headingFont given font is not loaded
    },
  },
};

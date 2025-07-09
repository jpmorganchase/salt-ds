import { withDateMock } from ".storybook/decorators/withDateMock";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { enUS as dateFnsEnUs } from "date-fns/locale";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Calendar/QA",
  component: Calendar,
  decorators: [withDateMock],
  globals: {
    a11y: {
      manual: true,
    },
  },
};

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
  modes: {
    theme: {
      themeNext: "disable",
    },
    themeNext: {
      themeNext: "enable",
      corner: "rounded",
      accent: "teal",
    },
  },
};

const renderQAContainer = () => {
  const { dateAdapter } = useLocalization();
  return (
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
        <CalendarGrid />
      </Calendar>
    </QAContainer>
  );
};

export const AllExamplesWithMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};

export const AllExamplesWithDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};

export const AllExamplesWithDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};

export const AllExamplesWithLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

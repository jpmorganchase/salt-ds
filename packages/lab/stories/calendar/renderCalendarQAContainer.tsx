import { withDateMock } from ".storybook/decorators/withDateMock";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import { QAContainer } from "docs/components";

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
};

export const renderCalendarQAContainer = () => {
  const { dateAdapter } = useLocalization();
  const isDayHighlighted = (day: ReturnType<typeof dateAdapter.date>) => {
    const startDate = dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date;
    const endDate = dateAdapter.parse("2024-05-04", "YYYY-MM-DD").date;
    return dateAdapter.compare(day, startDate) >= 0 &&
      dateAdapter.compare(day, endDate) <= 0
      ? "Test date highlighting"
      : false;
  };
  return (
    <QAContainer
      cols={4}
      itemPadding={1}
      width={1050}
      itemWidthAuto
      transposeDensity
      vertical
    >
      <Calendar
        selectionVariant="single"
        selectedDate={dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date}
      >
        <CalendarNavigation
          MonthDropdownProps={{ bordered: true }}
          YearDropdownProps={{ bordered: true }}
        />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="single"
        multiselect
        selectedDate={[
          dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date,
          dateAdapter.parse("2024-05-04", "YYYY-MM-DD").date,
        ]}
        isDayHighlighted={isDayHighlighted}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="range"
        selectedDate={{
          startDate: dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date,
          endDate: dateAdapter.parse("2024-05-04", "YYYY-MM-DD").date,
        }}
        isDayHighlighted={isDayHighlighted}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="range"
        multiselect
        selectedDate={[
          {
            startDate: dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date,
            endDate: dateAdapter.parse("2024-05-04", "YYYY-MM-DD").date,
          },
          {
            startDate: dateAdapter.parse("2024-05-08", "YYYY-MM-DD").date,
            endDate: dateAdapter.parse("2024-05-10", "YYYY-MM-DD").date,
          },
        ]}
      >
        <CalendarNavigation hideYearDropdown />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="offset"
        selectedDate={{
          startDate: dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date,
          endDate: dateAdapter.parse("2024-05-04", "YYYY-MM-DD").date,
        }}
        isDayHighlighted={isDayHighlighted}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
      <Calendar
        selectionVariant="offset"
        multiselect
        selectedDate={[
          {
            startDate: dateAdapter.parse("2024-05-02", "YYYY-MM-DD").date,
            endDate: dateAdapter.parse("2024-05-04", "YYYY-MM-DD").date,
          },
          {
            startDate: dateAdapter.parse("2024-05-08", "YYYY-MM-DD").date,
            endDate: dateAdapter.parse("2024-05-10", "YYYY-MM-DD").date,
          },
        ]}
      >
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
    </QAContainer>
  );
};

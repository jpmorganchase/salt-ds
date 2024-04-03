import { StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { Calendar } from "@salt-ds/lab";
import { parseDate } from "@internationalized/date";

export default {
  title: "Lab/Calendar/Calendar QA",
  component: Calendar,
};

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
      selectionVariant="default"
      selectedDate={parseDate("2024-04-02")}
    />
    <Calendar
      selectionVariant="range"
      selectedDate={{
        startDate: parseDate("2024-04-02"),
        endDate: parseDate("2024-04-04"),
      }}
    />
    <Calendar
      selectionVariant="offset"
      selectedDate={{
        startDate: parseDate("2024-04-02"),
        endDate: parseDate("2024-04-04"),
      }}
    />
    <Calendar
      selectionVariant="multiselect"
      selectedDate={[parseDate("2024-04-02"), parseDate("2024-04-04")]}
    />
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
  mockDate: "2024-04-01T00:00:00Z",
};

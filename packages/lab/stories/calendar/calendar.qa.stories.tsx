import { parseDate } from "@internationalized/date";
import { Calendar } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

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

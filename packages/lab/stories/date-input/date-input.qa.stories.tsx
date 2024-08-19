import { CalendarDate } from "@internationalized/date";
import { DateInputRange, DateInputSingle } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Date Input/QA",
  component: DateInputSingle,
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
    <DateInputSingle defaultDate={new CalendarDate(2025, 1, 2)} />
    <DateInputSingle defaultDate={new CalendarDate(2025, 1, 2)} bordered />
    <DateInputRange
      defaultDate={{
        startDate: new CalendarDate(2025, 1, 2),
        endDate: new CalendarDate(2025, 2, 3),
      }}
    />
    <DateInputRange
      defaultDate={{
        startDate: new CalendarDate(2025, 1, 2),
        endDate: new CalendarDate(2025, 2, 3),
      }}
      bordered
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

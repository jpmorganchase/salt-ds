import { Calendar } from "@salt-ds/date-components";
import type { StoryFn } from "@storybook/react-vite";
import type { QAContainerProps } from "docs/components";
import { withDateMock } from "../../../../.storybook/decorators/withDateMock";
import { calendarQaStories } from "./calendar.qa.stories";

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
};

export default {
  title: "Date Components/Calendar/QA",
  component: Calendar,
  decorators: [withDateMock],
  globals: {
    a11y: {
      manual: true,
    },
  },
};

// Due to performance issues with dayjs, render just "medium"
export const CalendarWithDayjs: StoryFn<QAContainerProps> = () =>
  calendarQaStories({ densities: ["medium"] });
CalendarWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};

import { Calendar } from "@salt-ds/date-components";
import type { StoryFn } from "@storybook/react-vite";
import { enUS as dateFnsEnUs } from "date-fns/locale";
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

export const CalendarWithDateFns: StoryFn<QAContainerProps> = () =>
  calendarQaStories();
CalendarWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};

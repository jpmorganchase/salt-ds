import type { StoryFn } from "@storybook/react-vite";
import type { QAContainerProps } from "docs/components";
import { withDateMock } from "../../../../.storybook/decorators/withDateMock";
import { Calendar } from "../../src";
import { renderCalendarQAContainer } from "./renderCalendarQAContainer";

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
};

export default {
  title: "Lab/Calendar/Calendar QA",
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
  renderCalendarQAContainer({ densities: ["medium"] });
CalendarWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};

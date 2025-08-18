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

/** Disabled for performance reasons - dayjs is slow with multiple calendars */
/*
export const CalendarWithDayjs: StoryFn<QAContainerProps> = () =>
  renderCalendarQAContainer();
CalendarWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};
 */

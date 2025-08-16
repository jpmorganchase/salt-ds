import type { StoryFn } from "@storybook/react-vite";
import type { QAContainerProps } from "docs/components";
import { withDateMock } from "../../../../.storybook/decorators/withDateMock";
import { Calendar } from "../../src";
import { renderCalendarQAContainer } from "./renderCalendarQAContainer";

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
};

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

export const CalendarWithMoment: StoryFn<QAContainerProps> = () =>
  renderCalendarQAContainer();
CalendarWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};

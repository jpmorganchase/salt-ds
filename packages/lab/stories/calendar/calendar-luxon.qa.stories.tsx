import type { StoryFn } from "@storybook/react-vite";
import type { QAContainerProps } from "docs/components";
import { withDateMock } from "../../../../.storybook/decorators/withDateMock";
import { Calendar } from "../../src";
import { renderCalendarQAContainer } from "./renderCalendarQAContainer";

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

export const CalendarExamplesWithLuxon: StoryFn<QAContainerProps> = () =>
  renderCalendarQAContainer();
CalendarExamplesWithLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

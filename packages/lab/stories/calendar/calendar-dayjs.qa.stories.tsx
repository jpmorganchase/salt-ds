import type { StoryFn } from "@storybook/react-vite";
import { type QAContainerProps } from "docs/components";
import { renderCalendarQAContainer} from "./renderCalendarQAContainer";
import {Calendar} from "../../src";
import {withDateMock} from "../../../../.storybook/decorators/withDateMock";

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

export const CalendarExamplesWithDayjs: StoryFn<QAContainerProps> = () =>
  renderCalendarQAContainer();
CalendarExamplesWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};

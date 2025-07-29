import type { StoryFn } from "@storybook/react-vite";
import { enUS as dateFnsEnUs } from "date-fns/locale";
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

export const CalendarWithDateFns: StoryFn<QAContainerProps> = () =>
  renderCalendarQAContainer();
CalendarWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};

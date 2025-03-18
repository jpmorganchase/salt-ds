import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  DatePickerTrigger,
  useLocalization,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

import { es as dateFnsEs } from "date-fns/locale";
import { enUS as dateFnsEnUs } from "date-fns/locale";
import "dayjs/locale/es";

export default {
  title: "Lab/Date Picker/QA",
  component: DatePicker,
};

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

const renderQAContainer = () => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { months: 4, weeks: 1 });

  const checkDayOfWeek = (
    day: string | false,
    targetDayIndex: number,
    luxonOffset: number,
    message: string,
  ) => {
    const dayOfWeek = dateAdapter.getDayOfWeek(day);
    const isTargetDay =
      (dateAdapter.lib === "luxon" && dayOfWeek === luxonOffset) ||
      (dateAdapter.lib !== "luxon" && dayOfWeek === targetDayIndex);

    return isTargetDay ? message : false;
  };

  const isMonday = (day: ReturnType<any>) =>
    checkDayOfWeek(day, 0, 1, "is a Monday");
  const isSaturday = (day: ReturnType<any>) =>
    checkDayOfWeek(day, 6, 5, "is a weekend");
  const isFriday = (day: ReturnType<any>) =>
    checkDayOfWeek(day, 5, 4, "is a Friday");

  return (
    <QAContainer itemPadding={10} width={1500} height={2000}>
      <DatePicker
        defaultSelectedDate={{
          startDate,
          endDate,
        }}
        isDayDisabled={isMonday}
        isDayHighlighted={isFriday}
        isDayUnselectable={isSaturday}
        selectionVariant="range"
        open
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel />
        </DatePickerOverlay>
      </DatePicker>
    </QAContainer>
  );
};

export const RangeWithMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};
export const RangeWithDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};
export const RangeWithDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};
export const RangeWithLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

export const RangeWithLocaleAndMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithLocaleAndMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "es-ES",
  dateAdapter: "moment",
};
export const RangeWithLocaleAndDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithLocaleAndDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEs,
  dateAdapter: "date-fns",
};
export const RangeWithLocaleAndDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithLocaleAndDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "es",
  dateAdapter: "dayjs",
};
export const RangeWithLocaleAndLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithLocaleAndLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "es-ES",
  dateAdapter: "luxon",
};

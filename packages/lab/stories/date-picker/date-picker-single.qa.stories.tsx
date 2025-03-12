import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSingleGridPanel,
  type DatePickerSingleProps,
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

const renderQAContainer = (
  props?: Omit<DatePickerSingleProps<unknown>, "selectionVariant">,
) => {
  const { dateAdapter } = useLocalization();
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
    <QAContainer itemPadding={10} width={1000}>
      <div style={{ height: 500 }}>
        <DatePicker
          defaultSelectedDate={dateAdapter.today()}
          selectionVariant="single"
          isDayDisabled={isMonday}
          isDayHighlighted={isFriday}
          isDayUnselectable={isSaturday}
          open
          {...props}
        >
          <DatePickerTrigger>
            <DatePickerSingleInput />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerSingleGridPanel />
          </DatePickerOverlay>
        </DatePicker>
      </div>
    </QAContainer>
  );
};

export const SingleWithMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};
export const SingleWithDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};
export const SingleWithDaysjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithDaysjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};
export const SingleWithLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

export const SingleWithLocaleAndMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithLocaleAndMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "es-ES",
  dateAdapter: "moment",
};
export const SingleWithLocaleAndDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithLocaleAndDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEs,
  dateAdapter: "date-fns",
};
export const SingleWithLocaleAndDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithLocaleAndDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "es",
  dateAdapter: "dayjs",
};
export const SingleWithLocaleAndLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
SingleWithLocaleAndLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "es-ES",
  dateAdapter: "luxon",
};

export const SingleDisabled: StoryFn<QAContainerProps> = () =>
  renderQAContainer({ disabled: true });
SingleWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};
export const SingleReadonly: StoryFn<QAContainerProps> = () =>
  renderQAContainer({ readOnly: true });
SingleWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};

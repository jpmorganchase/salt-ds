import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DatePickerRangeProps,
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
  props?: Omit<DatePickerRangeProps<unknown>, "selectionVariant">,
) => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { months: 4, weeks: 1 });
  return (
    <QAContainer itemPadding={10} width={1500}>
      <div style={{ height: "500px" }}>
        <DatePicker
          defaultSelectedDate={{
            startDate,
            endDate,
          }}
          selectionVariant="range"
          open
          {...props}
        >
          <DatePickerTrigger>
            <DatePickerRangeInput />
          </DatePickerTrigger>
          <DatePickerOverlay>
            <DatePickerRangePanel />
          </DatePickerOverlay>
        </DatePicker>
      </div>
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
export const RangeWithDaysjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
RangeWithDaysjs.parameters = {
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

export const RangeDisabled: StoryFn<QAContainerProps> = () =>
  renderQAContainer({ disabled: true });
RangeWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};
export const RangeReadonly: StoryFn<QAContainerProps> = () =>
  renderQAContainer({ readOnly: true });
RangeWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};

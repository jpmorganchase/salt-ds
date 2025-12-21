import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeGridPanel,
  type DatePickerRangeGridPanelProps,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DatePickerRangeProps,
  DatePickerTrigger,
  useLocalization,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { enUS as dateFnsEnUs, es as dateFnsEs } from "date-fns/locale";
import { QAContainer, type QAContainerProps } from "docs/components";
import "dayjs/locale/es";
import { withDateMock } from ".storybook/decorators/withDateMock";
import type { DateFrameworkType } from "@salt-ds/date-adapters";

export default {
  title: "Lab/Date Picker/QA",
  component: DatePicker,
  decorators: [withDateMock],
};

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
};

const renderQAContainer = ({
  numberOfVisibleMonths,
  ...props
}: Omit<DatePickerRangeProps, "selectionVariant"> & {
  numberOfVisibleMonths?: DatePickerRangeGridPanelProps["numberOfVisibleMonths"];
}) => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { months: 4, weeks: 1 });

  const checkDayOfWeek = (
    day: DateFrameworkType,
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

  // biome-ignore lint/suspicious/noExplicitAny: date framework dependent
  const isSaturday = (day: any) => checkDayOfWeek(day, 6, 5, "is a weekend");
  // biome-ignore lint/suspicious/noExplicitAny: date framework dependent
  const isFriday = (day: any) => checkDayOfWeek(day, 5, 4, "is a Friday");

  return (
    <QAContainer itemPadding={10} width={1500} height={2000}>
      <DatePicker
        defaultSelectedDate={{
          startDate,
          endDate,
        }}
        isDayHighlighted={isFriday}
        isDayUnselectable={isSaturday}
        selectionVariant="range"
        open
        {...props}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          {numberOfVisibleMonths ? (
            <DatePickerRangeGridPanel
              numberOfVisibleMonths={numberOfVisibleMonths}
              columns={numberOfVisibleMonths}
            />
          ) : (
            <DatePickerRangePanel />
          )}
        </DatePickerOverlay>
      </DatePicker>
    </QAContainer>
  );
};

export const RangeWithMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};
export const RangeWithDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};
export const RangeWithDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};
export const RangeWithLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

export const RangeWithLocaleAndMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithLocaleAndMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "es-ES",
  dateAdapter: "moment",
};
export const RangeWithLocaleAndDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithLocaleAndDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEs,
  dateAdapter: "date-fns",
};
export const RangeWithLocaleAndDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithLocaleAndDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "es",
  dateAdapter: "dayjs",
};
export const RangeWithLocaleAndLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer({});
RangeWithLocaleAndLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "es-ES",
  dateAdapter: "luxon",
};

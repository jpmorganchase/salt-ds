import { withDateMock } from ".storybook/decorators/withDateMock";
import { DateInputRange, DateInputSingle, useLocalization } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { enUS as dateFnsEnUs } from "date-fns/locale";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Date Input/QA",
  component: DateInputSingle,
  decorators: [withDateMock],
};

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
};

const renderQAContainer = () => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { months: 1, days: 1 });

  return (
    <QAContainer
      cols={4}
      itemPadding={1}
      height={3410}
      width={1050}
      itemWidthAuto
      transposeDensity
      vertical
    >
      <DateInputSingle defaultDate={startDate} />
      <DateInputSingle defaultDate={startDate} bordered />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
      />
    </QAContainer>
  );
};

export const AllExamplesWithMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};

export const AllExamplesWithDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};

export const AllExamplesWithDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};

export const AllExamplesWithLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
AllExamplesWithLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

import { withDateMock } from ".storybook/decorators/withDateMock";
import { DateInputRange, DateInputSingle, useLocalization } from "@salt-ds/date-components";
import type { StoryFn } from "@storybook/react-vite";
import { enUS as dateFnsEnUs } from "date-fns/locale";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Date Components/Date Input/QA",
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
      <DateInputSingle defaultDate={startDate} bordered readOnly />
      <DateInputSingle variant="secondary" defaultDate={startDate} />
      <DateInputSingle variant="secondary" defaultDate={startDate} bordered />
      <DateInputSingle
        variant="secondary"
        defaultDate={startDate}
        bordered
        readOnly
      />
      <DateInputSingle variant="tertiary" defaultDate={startDate} />
      <DateInputSingle variant="tertiary" defaultDate={startDate} bordered />
      <DateInputSingle
        variant="tertiary"
        defaultDate={startDate}
        bordered
        readOnly
      />
      <DateInputSingle
        defaultDate={startDate}
        bordered
        validationStatus="warning"
      />
      <DateInputSingle
        defaultDate={startDate}
        bordered
        validationStatus="error"
      />
      <DateInputSingle
        defaultDate={startDate}
        bordered
        validationStatus="success"
      />
      <DateInputSingle
        defaultDate={startDate}
        bordered
        validationStatus="warning"
        readOnly
      />
      <DateInputSingle
        defaultDate={startDate}
        bordered
        validationStatus="error"
        readOnly
      />
      <DateInputSingle
        defaultDate={startDate}
        bordered
        validationStatus="success"
        readOnly
      />

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
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        readOnly
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        variant="secondary"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        variant="secondary"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        readOnly
        variant="secondary"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        variant="tertiary"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        variant="tertiary"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        readOnly
        variant="tertiary"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        validationStatus="warning"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        validationStatus="error"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        validationStatus="success"
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        validationStatus="warning"
        readOnly
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        validationStatus="error"
        readOnly
      />
      <DateInputRange
        defaultDate={{
          startDate,
          endDate,
        }}
        bordered
        validationStatus="success"
        readOnly
      />
    </QAContainer>
  );
};

export const DateInputWithMoment: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
DateInputWithMoment.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "moment",
};

export const DateInputWithDateFns: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
DateInputWithDateFns.parameters = {
  ...QAContainerParameters,
  dateLocale: dateFnsEnUs,
  dateAdapter: "date-fns",
};

export const DateInputWithDayjs: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
DateInputWithDayjs.parameters = {
  ...QAContainerParameters,
  dateLocale: "en",
  dateAdapter: "dayjs",
};

export const DateInputWithLuxon: StoryFn<QAContainerProps> = () =>
  renderQAContainer();
DateInputWithLuxon.parameters = {
  ...QAContainerParameters,
  dateLocale: "en-US",
  dateAdapter: "luxon",
};

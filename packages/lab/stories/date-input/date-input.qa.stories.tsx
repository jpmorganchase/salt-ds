import { DateInputRange, DateInputSingle, useLocalization } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";
import moment from "moment";

export default {
  title: "Lab/Date Input/QA",
  component: DateInputSingle,
};

const today = moment().startOf("day");

export const AllExamples: StoryFn<QAContainerProps> = () => {
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

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
  modes: {
    theme: {
      themeNext: "disable",
    },
    themeNext: {
      themeNext: "enable",
      corner: "rounded",
      accent: "teal",
      // Ignore headingFont given font is not loaded
    },
  },
};

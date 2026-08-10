import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerSingleInput,
  DatePickerTrigger,
  MonthYearRangePanel,
  MonthYearSinglePanel,
  useLocalization,
} from "@salt-ds/date-components";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";
import { withDateMock } from "~storybook-decorators/withDateMock";

export default {
  title: "Date Components/Month Year Picker/QA",
  component: DatePicker,
  decorators: [withDateMock],
};

const QAContainerParameters = {
  chromatic: { disableSnapshot: false },
};

export const MonthYearPanel: StoryFn = () => {
  const { dateAdapter } = useLocalization();
  return (
    <QAContainer itemPadding={10} width={1200} height={2000}>
      <DatePicker
        selectionVariant="single"
        defaultSelectedDate={dateAdapter.today()}
        open
      >
        <DatePickerTrigger>
          <DatePickerSingleInput format="MMMM YYYY" />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
    </QAContainer>
  );
};
MonthYearPanel.parameters = QAContainerParameters;

export const RangeMonthYearPanel: StoryFn = () => {
  const { dateAdapter } = useLocalization();
  return (
    <QAContainer itemPadding={10} width={1500} height={2000}>
      <DatePicker
        selectionVariant="range"
        defaultSelectedDate={{
          startDate: dateAdapter.today(),
          endDate: dateAdapter.add(dateAdapter.today(), { months: 4 }),
        }}
        open
      >
        <DatePickerTrigger>
          <DatePickerRangeInput format="MMMM YYYY" />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearRangePanel />
        </DatePickerOverlay>
      </DatePicker>
    </QAContainer>
  );
};
RangeMonthYearPanel.parameters = QAContainerParameters;

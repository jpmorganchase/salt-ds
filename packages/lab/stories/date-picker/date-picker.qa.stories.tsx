import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  useLocalization,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Date Picker/QA",
  component: DatePicker,
};

export const SingleExamples: StoryFn<QAContainerProps> = () => {
  const { dateAdapter } = useLocalization();
  return (
    <QAContainer itemPadding={10} width={1000}>
      <div style={{ height: 500 }}>
        <DatePicker
          defaultSelectedDate={dateAdapter.today()}
          selectionVariant="single"
          open
        >
          <DatePickerSingleInput />
          <DatePickerOverlay>
            <DatePickerSinglePanel />
          </DatePickerOverlay>
        </DatePicker>
      </div>
    </QAContainer>
  );
};

SingleExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
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

export const SingleWithLocaleExamples: StoryFn<QAContainerProps> = () => {
  const { dateAdapter } = useLocalization();
  dateAdapter.locale = "es";
  return (
    <QAContainer itemPadding={10} width={1000}>
      <div style={{ height: 500 }}>
        <DatePicker
          defaultSelectedDate={dateAdapter.today()}
          selectionVariant="single"
          open
        >
          <DatePickerSingleInput />
          <DatePickerOverlay>
            <DatePickerSinglePanel />
          </DatePickerOverlay>
        </DatePicker>
      </div>
    </QAContainer>
  );
};

SingleWithLocaleExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
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

export const RangeExamples: StoryFn<QAContainerProps> = () => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { months: 1, weeks: 1 });
  return (
    <QAContainer itemPadding={10} width={1500}>
      <div style={{ height: "500px" }}>
        <DatePicker
          defaultSelectedDate={{ startDate, endDate }}
          selectionVariant="range"
          open
        >
          <DatePickerRangeInput />
          <DatePickerOverlay>
            <DatePickerRangePanel />
          </DatePickerOverlay>
        </DatePicker>
      </div>
    </QAContainer>
  );
};

RangeExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
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

export const RangeWithLocaleExamples: StoryFn<QAContainerProps> = () => {
  const { dateAdapter } = useLocalization();
  dateAdapter.locale = "es";
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
        >
          <DatePickerRangeInput />
          <DatePickerOverlay>
            <DatePickerRangePanel />
          </DatePickerOverlay>
        </DatePicker>
      </div>
    </QAContainer>
  );
};

RangeWithLocaleExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
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

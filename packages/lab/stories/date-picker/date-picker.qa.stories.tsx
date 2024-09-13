import { getLocalTimeZone, today } from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";
import React from "react";

const testLocale = "en-GB";

export default {
  title: "Lab/Date Picker/QA",
  component: DatePicker,
  locale: testLocale,
};

export const SingleExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer itemPadding={10} width={1000}>
    <div style={{ height: 500 }}>
      <DatePicker
        locale={testLocale}
        defaultSelectedDate={today(getLocalTimeZone())}
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

SingleExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
  mockDate: "2024-04-01T00:00:00Z",
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

export const SingleWithLocaleExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer itemPadding={10} width={1000}>
    <div style={{ height: 500 }}>
      <DatePicker
        locale={"es-ES"}
        timeZone={"Europe/Madrid"}
        defaultSelectedDate={today(getLocalTimeZone())}
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

SingleWithLocaleExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
  mockDate: "2024-04-01T00:00:00Z",
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

export const RangeExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer itemPadding={10} width={1500}>
    <div style={{ height: "500px" }}>
      <DatePicker
        locale={testLocale}
        defaultSelectedDate={{
          startDate: today(getLocalTimeZone()),
          endDate: today(getLocalTimeZone()).add({ months: 1, weeks: 1 }),
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

RangeExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
  mockDate: "2024-04-01T00:00:00Z",
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

export const RangeWithLocaleExamples: StoryFn<QAContainerProps> = () => (
  <QAContainer itemPadding={10} width={1500}>
    <div style={{ height: "500px" }}>
      <DatePicker
        defaultSelectedDate={{
          startDate: today(getLocalTimeZone()),
          endDate: today(getLocalTimeZone()).add({ months: 4, weeks: 1 }),
        }}
        selectionVariant="range"
        locale={"es-ES"}
        timeZone={"Europe/Madrid"}
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

RangeWithLocaleExamples.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
  mockDate: "2024-04-01T00:00:00Z",
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

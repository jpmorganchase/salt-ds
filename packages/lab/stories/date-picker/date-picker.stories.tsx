import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  Button,
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  type DateInputRangeValue,
  DatePicker,
  DatePickerActions,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DatePickerRangeProps,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type DatePickerSingleProps,
  type DatePickerState,
  type DateRangeSelection,
  type SingleDateSelection,
  createCalendarDate,
  useDatePickerContext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import React, { type ChangeEvent, useState } from "react";
import { CustomDatePickerPanel } from "./CustomDatePickerPanel";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

function isValidDate(dateString: string) {
  const datePattern = /^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/i;
  const match = dateString.match(datePattern);
  if (!match) {
    return false;
  }
  const day = Number.parseInt(match[1], 10);
  const monthStr = match[2].toLowerCase(); // Convert month to lowercase
  const year = Number.parseInt(match[3], 10);
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const monthIndex = months.indexOf(monthStr);
  if (monthIndex === -1) {
    return false;
  }
  const date = new Date(year, monthIndex, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
  );
}

const isValidDateString = (value: string | undefined) =>
  !value?.length || isValidDate(value);
function isValidOffsetString(offsetString: string) {
  const offsetPattern = /^\[+-]\d+$/;
  return offsetPattern.test(offsetString);
}

function formatDate(
  dateValue: SingleDateSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateFormatter = new DateFormatter(locale, options);
  return dateValue
    ? dateFormatter.format(dateValue.toDate(getLocalTimeZone()))
    : "N/A";
}

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const dateFormatter = new DateFormatter(locale, options);
  const formattedStartDate = startDate
    ? dateFormatter.format(startDate.toDate(getLocalTimeZone()))
    : "N/A";
  const formattedEndDate = endDate
    ? dateFormatter.format(endDate.toDate(getLocalTimeZone()))
    : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

const DatePickerSingleTemplate: StoryFn<DatePickerSingleProps> = (args) => {
  return (
    <DatePicker
      {...args}
      selectionVariant="single"
      onSelectedDateChange={(newSelectedDate) =>
        console.log(`Selected date: ${formatDate(newSelectedDate)}`)
      }
    >
      <DatePickerSingleInput />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

const DatePickerRangeTemplate: StoryFn<DatePickerRangeProps> = (args) => {
  return (
    <DatePicker
      {...args}
      selectionVariant="range"
      onSelectedDateChange={(newSelectedDate) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      }}
    >
      <DatePickerRangeInput />
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const Single = DatePickerSingleTemplate.bind({});
Single.args = {};

export const Range = DatePickerRangeTemplate.bind({});
Range.args = {
  selectionVariant: "range",
};

export const SingleControlled: StoryFn<DatePickerSingleProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  return (
    <DatePicker
      {...args}
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerSingleInput />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const RangeControlled: StoryFn<DatePickerRangeProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  return (
    <DatePicker
      {...args}
      selectionVariant="range"
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerRangeInput />
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const SingleWithMinMaxDate: StoryFn<DatePickerSingleProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = "Valid between 15/01/2030 and 15/01/2031";
  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"single"}
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
        }}
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            defaultVisibleMonth={new CalendarDate(2030, 1, 1)}
            helperText={helperText}
          />
        </DatePickerOverlay>
        <FormFieldHelperText>{helperText}</FormFieldHelperText>
      </DatePicker>
    </FormField>
  );
};

export const RangeWithMinMaxDate: StoryFn<DatePickerRangeProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const helperText = "Valid between 15/01/2030 and 15/01/2031";
  return (
    <FormField>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="range"
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          setSelectedDate(newSelectedDate);
        }}
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <DatePickerRangePanel
            defaultStartVisibleMonth={new CalendarDate(2030, 1, 1)}
            defaultEndVisibleMonth={new CalendarDate(2031, 1, 1)}
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormFieldHelperText>{helperText}</FormFieldHelperText>
    </FormField>
  );
};

export const SingleWithCustomFormat: StoryFn<DatePickerSingleProps> = (
  args,
) => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  return (
    <DatePicker
      {...args}
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerSingleInput
        formatDate={(date: DateValue | null | undefined): string => {
          return date
            ? new DateFormatter("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(date.toDate(getLocalTimeZone()))
            : "";
        }}
        placeholder={"MM DD YYYY"}
      />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const RangeWithCustomFormat: StoryFn<DatePickerRangeProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  return (
    <DatePicker
      {...args}
      selectionVariant={"range"}
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerRangeInput
        formatDate={(date: DateValue | null | undefined): string => {
          return date
            ? new DateFormatter("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(date.toDate(getLocalTimeZone()))
            : "";
        }}
        placeholder={"MM DD YYYY"}
      />
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const SingleWithInitialError: StoryFn<DatePickerSingleProps> = (
  args,
) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="single"
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
      >
        <DatePickerSingleInput
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newInputValue = event.target.value;
            const validationStatus = isValidDateString(newInputValue)
              ? undefined
              : "error";
            setValidationStatus(validationStatus);
          }}
          defaultValue="bad date"
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithInitialError: StoryFn<DatePickerRangeProps> = (args) => {
  const helperText = "Select range (DD MMM YYYY - DD MMM YYYY)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="range"
        onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          //setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
        defaultSelectedDate={{ startDate: new CalendarDate(2024, 6, 9) }}
      >
        <DatePickerRangeInput
          onChange={(
            _e: ChangeEvent<HTMLInputElement>,
            selectedDate?: DateInputRangeValue,
          ) => {
            const startDateValue = selectedDate?.startDate;
            const endDateValue = selectedDate?.endDate;
            const validationStatus =
              isValidDateString(startDateValue) &&
              isValidDateString(endDateValue)
                ? undefined
                : "error";
            setValidationStatus(validationStatus);
          }}
          defaultValue={{ startDate: "09 Jun 2024", endDate: "bad date" }}
          defaultDate={{ startDate: new CalendarDate(2024, 6, 9) }}
        />
        <DatePickerOverlay>
          <DatePickerRangePanel
            helperText={helperText}
            defaultStartVisibleMonth={new CalendarDate(2024, 6, 1)}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithValidation: StoryFn<DatePickerSingleProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="single"
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
      >
        <DatePickerSingleInput
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newInputValue = event.target.value;
            const validationStatus = isValidDateString(newInputValue)
              ? undefined
              : "error";
            setValidationStatus(validationStatus);
          }}
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithValidation: StoryFn<DatePickerRangeProps> = (args) => {
  const helperText = "Select range (DD MMM YYYY - DD MMM YYYY)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="range"
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
      >
        <DatePickerRangeInput
          onChange={(
            _e: ChangeEvent<HTMLInputElement>,
            selectedDate?: DateInputRangeValue,
          ) => {
            const startDateValue = selectedDate?.startDate;
            const endDateValue = selectedDate?.endDate;
            const validationStatus =
              isValidDateString(startDateValue) &&
              isValidDateString(endDateValue)
                ? undefined
                : "error";
            setValidationStatus(validationStatus);
          }}
        />
        <DatePickerOverlay>
          <DatePickerRangePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithCustomPanel: StoryFn<DatePickerSingleProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const minDate = today(getLocalTimeZone());
  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        selectionVariant="single"
        onSelectedDateChange={(newSelectedDate) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        }}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="single"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithCustomPanel: StoryFn<DatePickerRangeProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const minDate = today(getLocalTimeZone());
  return (
    <FormField>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        {...args}
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        selectionVariant="range"
        onSelectedDateChange={(newSelectedDate) => {
          console.log(`Selected date: ${formatDateRange(newSelectedDate)}`);
        }}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="range"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithToday: StoryFn<DatePickerSingleProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const TodayButton = () => {
    const {
      helpers: { setSelectedDate },
    } = useDatePickerContext({
      selectionVariant: "single",
    }) as DatePickerState<SingleDateSelection>;

    return (
      <Button
        style={{ width: "100%" }}
        onClick={() => setSelectedDate(today(getLocalTimeZone()))}
      >
        Today
      </Button>
    );
  };
  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="single"
        onSelectedDateChange={(newSelectedDate) => {
          console.log(`Selected date range: ${formatDate(newSelectedDate)}`);
        }}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerSinglePanel />
            </FlexItem>
            <FlexItem>
              <TodayButton />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithConfirmation: StoryFn<DatePickerSingleProps> = (
  args,
) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="single"
        onSelectedDateChange={(newSelectedDate) => {
          console.log(`Selected date range: ${formatDate(newSelectedDate)}`);
        }}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerSinglePanel />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerActions selectionVariant="single" />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithConfirmation: StoryFn<DatePickerRangeProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const minDate = today(getLocalTimeZone());
  return (
    <FormField>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="range"
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        onSelectedDateChange={(newSelectedDate) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
        }}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerRangePanel helperText={helperText} />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerActions selectionVariant="range" />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithCustomParser: StoryFn<DatePickerSingleProps> = (
  args,
) => {
  const helperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="single"
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(undefined);
        }}
      >
        <DatePickerSingleInput
          parse={(inputDate: string | undefined): CalendarDate | undefined => {
            let parsedDate = inputDate;
            const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
            if (offsetMatch) {
              const offsetDays = Number.parseInt(offsetMatch[1], 10);
              let offsetDate = selectedDate
                ? selectedDate
                : today(getLocalTimeZone());
              offsetDate = offsetDate.add({ days: offsetDays });
              parsedDate = new DateFormatter("EN-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(offsetDate.toDate(getLocalTimeZone()));
            }
            return createCalendarDate(parsedDate);
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newInputValue = event.target.value;
            const validationStatus =
              isValidDateString(newInputValue) ||
              isValidOffsetString(newInputValue)
                ? undefined
                : "error";
            setValidationStatus(validationStatus);
          }}
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const Bordered = DatePickerSingleTemplate.bind({});
Bordered.args = {
  bordered: true,
};

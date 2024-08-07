import {
  CalendarDate,
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
  formatDate,
  useDatePickerContext,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import React, { type ChangeEvent, useState } from "react";
import { CustomDatePickerPanel } from "./CustomDatePickerPanel";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

function validateShortDate(
  dateString: string,
  locale = getCurrentLocale(),
): boolean {
  try {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const parts = dateFormatter.formatToParts(new Date(dateString));
    const dayPart = parts.find((part) => part.type === "day");
    const monthPart = parts.find((part) => part.type === "month");
    const yearPart = parts.find((part) => part.type === "year");
    console.log(parts);
    if (!dayPart || !monthPart || !yearPart) {
      return false;
    }

    const day = Number.parseInt(dayPart.value, 10);
    const monthStr = monthPart.value.toLowerCase(); // Convert month to lowercase
    const year = Number.parseInt(yearPart.value, 10);

    function getMonthNames() {
      const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
      const months = [];
      for (let month = 0; month < 12; month++) {
        const date = new Date(2021, month, 1);
        months.push(formatter.format(date));
      }
      return months;
    }
    const months = getMonthNames();
    const monthIndex = months.indexOf(monthStr);
    if (monthIndex === -1 || monthIndex === undefined) {
      return false;
    }

    const date = new Date(year, monthIndex, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === monthIndex &&
      date.getDate() === day
    );
  } catch (error) {
    return false;
  }
}

function validateNumericDate(dateString: string, format: string): boolean {
  let regex, day, month, year;

  if (format === "MM/DD/YYYY") {
    regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const parts = dateString.split("/");
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (format === "DD/MM/YYYY") {
    regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const parts = dateString.split("/");
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else {
    // Unsupported format
    return false;
  }

  if (month < 1 || month > 12 || year < 1000 || year > 9999) {
    return false;
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  return !(day < 1 || day > daysInMonth);
}

const isValidShortDate = (
  value: string | undefined,
  locale = getCurrentLocale(),
) => !value?.length || validateShortDate(value, locale);
const isValidNumericDate = (value: string | undefined, format = "DD/MM/YYYY") =>
  !value?.length || validateNumericDate(value, format);

function isValidOffsetString(offsetString: string) {
  const offsetPattern = /^\[+-]\d+$/;
  return offsetPattern.test(offsetString);
}

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate ? formatDate(startDate, locale) : "N/A";
  const formattedEndDate = endDate ? formatDate(endDate, locale) : "N/A";
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
            const validationStatus = isValidShortDate(newInputValue)
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
              isValidShortDate(startDateValue) && isValidShortDate(endDateValue)
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
            const validationStatus = isValidShortDate(newInputValue)
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
              isValidShortDate(startDateValue) && isValidShortDate(endDateValue)
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
          parse={(inputDate: string | undefined): DateValue | undefined => {
            const parsedDate = inputDate;
            const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
            if (offsetMatch) {
              const offsetDays = Number.parseInt(offsetMatch[1], 10);
              let offsetDate = selectedDate
                ? selectedDate
                : today(getLocalTimeZone());
              offsetDate = offsetDate.add({ days: offsetDays });
              return new CalendarDate(
                offsetDate.year,
                offsetDate.month,
                offsetDate.day,
              );
            }
            return createCalendarDate(parsedDate);
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newInputValue = event.target.value;
            const validationStatus =
              isValidShortDate(newInputValue) ||
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

export const SingleWithLocaleUS: StoryFn<DatePickerSingleProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = "Date format MM/DD/YYYY";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  function parseDateStringEnUS(
    dateString: string | undefined,
  ): DateValue | undefined {
    if (!dateString) {
      return undefined;
    }
    const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateParts) {
      return undefined;
    }
    const [, month, day, year] = dateParts;
    return new CalendarDate(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      Number.parseInt(day, 10),
    );
  }

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={"en-US"}
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(`Selected date: ${formatDate(newSelectedDate, "en-US")}`);
          setSelectedDate(newSelectedDate);
        }}
      >
        <DatePickerSingleInput
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newInputValue = event.target.value;
            const validationStatus = isValidNumericDate(
              newInputValue,
              "MM/DD/YYYY",
            )
              ? undefined
              : "error";
            setValidationStatus(validationStatus);
          }}
          parse={parseDateStringEnUS}
          placeholder={"MM/DD/YYYY"}
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithLocaleES: StoryFn<DatePickerRangeProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const helperText = "Date format DD/MM/YYYY";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  function parseDateStringEsES(
    dateString: string | undefined,
  ): DateValue | undefined {
    if (!dateString) {
      return undefined;
    }
    const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateParts) {
      return undefined;
    }
    const [, day, month, year] = dateParts;
    return new CalendarDate(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      Number.parseInt(day, 10),
    );
  }

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"range"}
        selectedDate={selectedDate}
        locale={"es-ES"}
        onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
          console.log(`Selected date: ${formatDateRange(newSelectedDate, "es-ES")}`);
          setSelectedDate(newSelectedDate);
        }}
      >
        <DatePickerRangeInput
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newInputValue = event.target.value;
            const validationStatus = isValidNumericDate(
              newInputValue,
              "DD/MM/YYYY",
            )
              ? undefined
              : "error";
            setValidationStatus(validationStatus);
          }}
          parse={parseDateStringEsES}
          placeholder={"DD/MM/YYYY"}
        />
        <DatePickerOverlay>
          <DatePickerRangePanel />
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


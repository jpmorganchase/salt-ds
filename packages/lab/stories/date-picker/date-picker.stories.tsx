import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  now,
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
  formatDate,
  getCurrentLocale,
  parseCalendarDate,
  parseZonedDateTime,
  useDatePickerContext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type React from "react";
import { SyntheticEvent, useState } from "react";
import { CustomDatePickerPanel } from "./CustomDatePickerPanel";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

function validateShortDate(
  dateString: string,
  locale: string = getCurrentLocale(),
) {
  // Regular expression to match the expected date format (e.g., "01 May 1970")
  const datePattern = /^(\d{2}) (\w{3}) (\d{4})$/;
  const match = dateString.match(datePattern);

  // Check if the date string matches the expected format
  if (!match) {
    return false;
  }

  const [, dayStr, monthStr, yearStr] = match;
  const day = Number.parseInt(dayStr, 10);
  const monthInput = monthStr.toLowerCase();
  const year = Number.parseInt(yearStr, 10);

  // Function to get month names in the specified locale
  function getMonthNames() {
    const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
    const months = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(2021, month, 1);
      months.push(formatter.format(date).toLowerCase());
    }
    return months;
  }

  const months = getMonthNames();
  const monthIndex = months.indexOf(monthInput);

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

function validateNumericDate(dateString: string, format: string): boolean {
  let regex: RegExp;
  let day: number;
  let month: number;
  let year: number;

  if (format === "MM/DD/YYYY") {
    regex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const parts = dateString.split("/");
    month = Number.parseInt(parts[0], 10);
    day = Number.parseInt(parts[1], 10);
    year = Number.parseInt(parts[2], 10);
  } else if (format === "DD/MM/YYYY") {
    regex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const parts = dateString.split("/");
    day = Number.parseInt(parts[0], 10);
    month = Number.parseInt(parts[1], 10);
    year = Number.parseInt(parts[2], 10);
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
  dateValue: string | undefined,
  locale = getCurrentLocale(),
) => !dateValue?.length || validateShortDate(dateValue, locale);
const isValidNumericDate = (
  dateValue: string | undefined,
  format = "DD/MM/YYYY",
) => !dateValue?.length || validateNumericDate(dateValue, format);

function isValidOffsetString(offsetString: string) {
  const offsetPattern = /^\+(\d+)?$/;
  return offsetPattern.test(offsetString);
}

function isValidDateRange(date: DateRangeSelection | null) {
  if (
    date?.startDate &&
    date?.endDate &&
    date.startDate.compare(date.endDate) > 0
  ) {
    return false;
  }
  return true;
}

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate
    ? formatDate(startDate, locale, options)
    : "N/A";
  const formattedEndDate = endDate
    ? formatDate(endDate, locale, options)
    : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

const DatePickerSingleTemplate: StoryFn<DatePickerSingleProps> = (args) => {
  return (
    <DatePicker
      {...args}
      selectionVariant="single"
      onSelectedDateChange={(newSelectedDate) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        args?.onSelectedDateChange?.(newSelectedDate);
      }}
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
        args?.onSelectedDateChange?.(newSelectedDate);
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
    args?.selectedDate ?? null,
  );
  return (
    <DatePicker
      {...args}
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
        args?.onSelectedDateChange?.(newSelectedDate);
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
    args?.selectedDate ?? null,
  );
  return (
    <DatePicker
      {...args}
      selectionVariant="range"
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
        args?.onSelectedDateChange?.(newSelectedDate);
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
          args?.onSelectedDateChange?.(newSelectedDate);
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
          args?.onSelectedDateChange?.(newSelectedDate);
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
          args?.onSelectedDateChange?.(newSelectedDate);
        }}
      >
        <DatePickerSingleInput
          onDateValueChange={(newDateValue: string) => {
            const validationStatus = isValidShortDate(newDateValue)
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
          const validationStatus = isValidDateRange(newSelectedDate)
            ? undefined
            : "error";
          setValidationStatus(validationStatus);
          args?.onSelectedDateChange?.(newSelectedDate);
        }}
        defaultSelectedDate={{ startDate: new CalendarDate(2024, 6, 9) }}
      >
        <DatePickerRangeInput
          onDateValueChange={(newDateValue?: DateInputRangeValue) => {
            const validationStatus =
              isValidShortDate(newDateValue?.startDate) &&
              isValidShortDate(newDateValue?.endDate)
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

export const SingleWithFormField: StoryFn<DatePickerSingleProps> = (args) => {
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
          args?.onSelectedDateChange?.(newSelectedDate);
        }}
      >
        <DatePickerSingleInput
          onDateValueChange={(newDateValue: string) => {
            const validationStatus = isValidShortDate(newDateValue)
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

export const RangeWithFormField: StoryFn<DatePickerRangeProps> = (args) => {
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
          const validationStatus = isValidDateRange(newSelectedDate)
            ? undefined
            : "error";
          setValidationStatus(validationStatus);
          args?.onSelectedDateChange?.(newSelectedDate);
        }}
      >
        <DatePickerRangeInput
          onDateValueChange={(newDateValue?: DateInputRangeValue) => {
            const validationStatus =
              isValidShortDate(newDateValue?.startDate) &&
              isValidShortDate(newDateValue?.endDate)
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
          args?.onSelectedDateChange?.(newSelectedDate);
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
        onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          args?.onSelectedDateChange?.(newSelectedDate);
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

export const SingleWithToday: StoryFn<DatePickerSingleProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="single"
        onSelectedDateChange={(newSelectedDate) => {
          console.log(`Selected date range: ${formatDate(newSelectedDate)}`);
          args?.onSelectedDateChange?.(newSelectedDate);
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
          args?.onSelectedDateChange?.(newSelectedDate);
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
          args?.onSelectedDateChange?.(newSelectedDate);
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
          args?.onSelectedDateChange?.(newSelectedDate);
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
            return parseCalendarDate(parsedDate);
          }}
          onDateValueChange={(newDateValue: string) => {
            const validationStatus =
              isValidShortDate(newDateValue) ||
              isValidOffsetString(newDateValue)
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

const parseDateStringEnUS = (
  dateString: string | undefined,
): DateValue | undefined => {
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
};

const formatDateStringEnUS = (
  date: DateValue | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  const preferredLocale = locale || getCurrentLocale();
  const preferredTimeZone = options?.timeZone || getLocalTimeZone();
  return date
    ? new DateFormatter(preferredLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...options,
        timeZone: preferredTimeZone,
      }).format(date.toDate(preferredTimeZone))
    : "";
};

export const SingleWithLocale: StoryFn<DatePickerSingleProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = "Date format MM/DD/YYYY";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={"en-US"}
        timeZone={"America/New_York"}
        onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
          console.log(
            `Selected date: ${formatDateStringEnUS(newSelectedDate, "en-US", { timeZone: "America/New_York" })}`,
          );
          setSelectedDate(newSelectedDate);
          args?.onSelectedDateChange?.(newSelectedDate);
        }}
      >
        <DatePickerSingleInput
          onDateValueChange={(newDateValue: string) => {
            const validationStatus = isValidNumericDate(
              newDateValue,
              "MM/DD/YYYY",
            )
              ? undefined
              : "error";
            setValidationStatus(validationStatus);
          }}
          formatDate={formatDateStringEnUS}
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

const parseDateStringEsES = (
  dateString: string | undefined,
): DateValue | undefined => {
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
};

const formatDateStringEsES = (
  date: DateValue | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
) => {
  const preferredLocale = locale || getCurrentLocale();
  const preferredTimeZone = options?.timeZone || getLocalTimeZone();
  return date
    ? new DateFormatter(preferredLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...options,
        timeZone: preferredTimeZone,
      }).format(date.toDate(preferredTimeZone))
    : "";
};

export const RangeWithLocale: StoryFn<DatePickerRangeProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const helperText = "Date format DD/MM/YYYY";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"range"}
        selectedDate={selectedDate}
        locale={"es-ES"}
        timeZone={"Europe/Madrid"}
        onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          setSelectedDate(newSelectedDate);
          const validationStatus = isValidDateRange(newSelectedDate)
            ? undefined
            : "error";
          setValidationStatus(validationStatus);
          args?.onSelectedDateChange?.(newSelectedDate);
        }}
      >
        <DatePickerRangeInput
          onDateValueChange={(newDateValue?: DateInputRangeValue) => {
            const validationStatus =
              isValidNumericDate(newDateValue?.startDate, "DD/MM/YYYY") &&
              isValidNumericDate(newDateValue?.endDate, "DD/MM/YYYY")
                ? undefined
                : "error";
            setValidationStatus(validationStatus);
          }}
          formatDate={formatDateStringEsES}
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

export const SingleBordered: StoryFn<DatePickerSingleProps> = (args) => {
  return (
    <DatePicker
      {...args}
      selectionVariant="single"
      onSelectedDateChange={(newSelectedDate) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        args?.onSelectedDateChange?.(newSelectedDate);
      }}
    >
      <DatePickerSingleInput bordered />
      <DatePickerOverlay>
        <DatePickerSinglePanel
          NavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
        />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const RangeBordered: StoryFn<DatePickerRangeProps> = (args) => {
  return (
    <DatePicker
      {...args}
      selectionVariant="range"
      onSelectedDateChange={(newSelectedDate) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        args?.onSelectedDateChange?.(newSelectedDate);
      }}
    >
      <DatePickerRangeInput bordered />
      <DatePickerOverlay>
        <DatePickerRangePanel
          StartNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
          EndNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
        />
      </DatePickerOverlay>
    </DatePicker>
  );
};

const DatePickerTimeInput: React.FC = () => {
  const {
    helpers: { setSelectedDate },
    state: { selectedDate },
  } = useDatePickerContext({
    selectionVariant: "range",
  }) as DatePickerState<DateRangeSelection>;

  function parseTime(timeValue: string): {
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  } | null {
    // Regular expression to match the time format HH:MM, HH:MM:SS, or HH:MM:SS.SSS
    const timePattern = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
    const match = timeValue.match(timePattern);
    if (!match) {
      return null;
    }

    const hour = Number.parseInt(match[1], 10);
    const minute = Number.parseInt(match[2], 10);
    const second = match[3] ? Number.parseInt(match[3], 10) : 0; // Default to 0 if seconds are not provided
    const millisecond = match[4]
      ? Number.parseInt(match[4].padEnd(3, "0"), 10)
      : 0; // Default to 0 if milliseconds are not provided

    return { hour, minute, second, millisecond };
  }

  const handleStartTimeChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    console.log(event.target.value);
    const parsedTime = parseTime(event.target.value);
    if (!parsedTime) {
      return;
    }
    const { hour, minute, second, millisecond } = parsedTime;
    let startDate = selectedDate?.startDate ?? now(getLocalTimeZone());
    startDate = startDate.set({ hour, minute, second, millisecond });

    const newDateTime: DateRangeSelection = {
      ...selectedDate,
      startDate,
    };
    setSelectedDate(newDateTime);
  };
  const handleEndTimeChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    console.log(event.target.value);
    const parsedTime = parseTime(event.target.value);
    if (!parsedTime) {
      return;
    }
    const { hour, minute, second, millisecond } = parsedTime;
    let endDate = selectedDate?.endDate ?? now(getLocalTimeZone());
    endDate = endDate.set({ hour, minute, second, millisecond });

    const newDateTime: DateRangeSelection = {
      ...selectedDate,
      endDate,
    };
    setSelectedDate(newDateTime);
  };

  return (
    <>
      <DatePickerRangeInput bordered />
      <input
        aria-label="start date time"
        type={"time"}
        onChange={handleStartTimeChange}
      />
      <input
        aria-label="end date time"
        type={"time"}
        onChange={handleEndTimeChange}
      />
    </>
  );
};
export const WithExperimentalTime: StoryFn<DatePickerRangeProps> = (args) => {
  return (
    <DatePicker
      {...args}
      selectionVariant="range"
      onSelectedDateChange={(newSelectedDate) => {
        console.log(
          `Selected date range: ${formatDateRange(
            newSelectedDate,
            getCurrentLocale(),
            {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            },
          )}`,
        );
        args?.onSelectedDateChange?.(newSelectedDate);
      }}
    >
      <DatePickerTimeInput />
      <DatePickerOverlay>
        <DatePickerRangePanel
          StartNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
          EndNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
        />
      </DatePickerOverlay>
    </DatePicker>
  );
};

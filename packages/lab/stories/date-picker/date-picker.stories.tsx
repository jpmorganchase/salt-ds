import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  type ZonedDateTime,
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
  type DateInputRangeParserResult,
  type DateInputSingleParserResult,
  DatePicker,
  DatePickerActions,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DatePickerRangeProps,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type DatePickerSingleProps,
  type DateRangeSelection,
  type RangeDatePickerState,
  type SingleDatePickerState,
  type SingleDateSelection,
  formatDate,
  getCurrentLocale,
  parseCalendarDate,
  useDatePickerContext,
  SingleDatePickerError,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type React from "react";
import { useState } from "react";
import { CustomDatePickerPanel } from "./CustomDatePickerPanel";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

function isValidDateRange(date: DateRangeSelection | null) {
  if (date?.startDate === null || date?.endDate === null) {
    return true;
  }
  return !(
    date?.startDate &&
    date?.endDate &&
    date.startDate.compare(date.endDate) > 0
  );
}

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate
    ? formatDate(startDate, locale, options)
    : startDate;
  const formattedEndDate = endDate
    ? formatDate(endDate, locale, options)
    : endDate;
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}
function formatSingleDate(
  date: DateValue | null,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
) {
  if (date) {
    return formatDate(date, locale, options);
  }
  return date;
}

const DatePickerSingleTemplate: StoryFn<DatePickerSingleProps> = (args) => {
  return (
    <DatePicker
      {...args}
      selectionVariant="single"
      onSelectedDateChange={(newSelectedDate, error) => {
        console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
        args?.onSelectedDateChange?.(newSelectedDate, error);
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
      onSelectedDateChange={(newSelectedDate, error) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        args?.onSelectedDateChange?.(newSelectedDate, error);
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
      onSelectedDateChange={(newSelectedDate, error) => {
        console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
        args?.onSelectedDateChange?.(newSelectedDate, error);
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
      onSelectedDateChange={(newSelectedDate, error) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
        args?.onSelectedDateChange?.(newSelectedDate, error);
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          args?.onSelectedDateChange?.(newSelectedDate, error);
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          setSelectedDate(newSelectedDate);
          args?.onSelectedDateChange?.(newSelectedDate, error);
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(error ? "error" : undefined);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
      >
        <DatePickerSingleInput defaultValue="bad date" />
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          const validationStatus =
            !error.startDate &&
            !error.endDate &&
            isValidDateRange(newSelectedDate)
              ? undefined
              : "error";
          setValidationStatus(validationStatus);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
        defaultSelectedDate={{ startDate: new CalendarDate(2024, 6, 9) }}
      >
        <DatePickerRangeInput
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(error ? "error" : undefined);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
      >
        <DatePickerSingleInput />
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          setSelectedDate(newSelectedDate);
          const validationStatus =
            !error.startDate &&
            !error.endDate &&
            isValidDateRange(newSelectedDate)
              ? undefined
              : "error";
          setValidationStatus(validationStatus);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
      >
        <DatePickerRangeInput />
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          args?.onSelectedDateChange?.(newSelectedDate, error);
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          args?.onSelectedDateChange?.(newSelectedDate, error);
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
  }) as SingleDatePickerState;

  return (
    <Button
      style={{ width: "100%" }}
      onClick={() => setSelectedDate(today(getLocalTimeZone()), false)}
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          args?.onSelectedDateChange?.(newSelectedDate, error);
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
  const helperText = "Select range (DD MMM YYYY - DD MMM YYYY)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    args.selectedDate || null,
  );
  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="single"
        selectedDate={selectedDate}
        onApply={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          setValidationStatus(error ? "error" : undefined);
          args?.onApply?.(newSelectedDate, error);
        }}
        onSelectedDateChange={(newSelectedDate, error) => {
          setSelectedDate(newSelectedDate);
          args?.onSelectedDateChange?.(newSelectedDate, error);
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
  const helperText = "Select range (DD MMM YYYY - DD MMM YYYY)";
  const minDate = today(getLocalTimeZone());
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    args.selectedDate || null,
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="range"
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        selectedDate={selectedDate}
        onApply={(newSelectedDate, error) => {
          console.log(
            `Selected date range: ${formatDateRange(newSelectedDate)}`,
          );
          const validationStatus =
            !error.startDate &&
            !error.endDate &&
            isValidDateRange(newSelectedDate)
              ? undefined
              : "error";
          setValidationStatus(validationStatus);
          args?.onApply?.(newSelectedDate, error);
        }}
        onSelectedDateChange={(newSelectedDate, error) => {
          setSelectedDate(newSelectedDate);
          args?.onSelectedDateChange?.(newSelectedDate, error);
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
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
          setValidationStatus(error ? "error" : undefined);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
      >
        <DatePickerSingleInput
          parse={(inputDate: string): DateInputSingleParserResult => {
            if (!inputDate?.length) {
              return { date: null, error: false };
            }
            const parsedDate = inputDate;
            const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
            if (offsetMatch) {
              const offsetDays = Number.parseInt(offsetMatch[1], 10);
              let offsetDate = selectedDate
                ? selectedDate
                : today(getLocalTimeZone());
              offsetDate = offsetDate.add({ days: offsetDays });
              return {
                date: new CalendarDate(
                  offsetDate.year,
                  offsetDate.month,
                  offsetDate.day,
                ),
                error: false,
              };
            }
            return parseCalendarDate(parsedDate || "");
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

export const SingleWithLocaleEnUS: StoryFn<DatePickerSingleProps> = (args) => {
  const locale = "en-US";
  const timeZone = "America/New_York";

  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = `Locale ${locale} - Time Zone ${timeZone}`;
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const parseDateEnUS = (dateString: string): DateInputSingleParserResult => {
    if (!dateString?.length) {
      return { date: null, error: false };
    }
    const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateParts) {
      return { date: null, error: "invalid date" };
    }
    const [, month, day, year] = dateParts;
    return {
      date: new CalendarDate(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10),
        Number.parseInt(day, 10),
      ),
      error: false,
    };
  };

  const formatDateEnUS = (date: DateValue | null) => {
    return date
      ? new DateFormatter(locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone,
        }).format(date.toDate(timeZone))
      : "";
  };

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={locale}
        timeZone={timeZone}
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(`Selected date: ${formatDateEnUS(newSelectedDate)}`);
          setValidationStatus(error ? "error" : undefined);
          setSelectedDate(newSelectedDate);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
      >
        <DatePickerSingleInput
          format={formatDateEnUS}
          parse={parseDateEnUS}
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

export const SingleWithLocaleZhCN: StoryFn<DatePickerSingleProps> = (args) => {
  const locale = "zh-CN";
  const timeZone = "Asia/Shanghai";
  const formatDateZhCN = (date: DateValue | null) => {
    return date
      ? new DateFormatter(locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date.toDate(timeZone))
      : "";
  };

  const parseDateZhCN = (dateString: string): DateInputSingleParserResult => {
    if (!dateString?.length) {
      return { date: null, error: false };
    }
    const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateParts) {
      return { date: null, error: "invalid date" };
    }
    const [, month, day, year] = dateParts;
    return {
      date: new CalendarDate(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10),
        Number.parseInt(day, 10),
      ),
      error: false,
    };
  };

  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    args.selectedDate || null,
  );
  const helperText = `Locale ${locale} - Time Zone ${timeZone}`;
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const formatMonth = (date: DateValue) =>
    formatDate(date, locale, {
      month: "long",
      day: undefined,
      year: undefined,
    });

  function renderDayContents(day: DateValue) {
    const formatter = new DateFormatter("en-US", { day: "numeric" });
    return <>{formatter.format(day.toDate(timeZone))}</>;
  }

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"single"}
        selectedDate={selectedDate}
        locale={locale}
        timeZone={timeZone}
        onSelectedDateChange={(
          newSelectedDate: SingleDateSelection | null,
          error: SingleDatePickerError,
        ) => {
          console.log(
            `Selected date: ${formatDateZhCN(newSelectedDate ?? null)}`,
          );
          setSelectedDate(newSelectedDate);
          setValidationStatus(error ? "error" : undefined);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
      >
        <DatePickerSingleInput
          format={formatDateZhCN}
          parse={parseDateZhCN}
          placeholder={"YYYY/MM/DD"}
        />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            CalendarProps={{ renderDayContents }}
            CalendarNavigationProps={{ formatMonth }}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithLocaleEsES: StoryFn<DatePickerRangeProps> = (args) => {
  const locale = "es-ES";
  const timeZone = "Europe/Madrid";

  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const helperText = `Locale ${locale} - Time Zone ${timeZone}`;
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const parseDateEsES = (
    dateString: string | undefined,
  ): DateInputRangeParserResult => {
    if (!dateString) {
      return { date: null, error: false };
    }
    const dateParts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateParts) {
      return { date: null, error: "invalid date" };
    }
    const [, day, month, year] = dateParts;
    return {
      date: new CalendarDate(
        Number.parseInt(year, 10),
        Number.parseInt(month, 10),
        Number.parseInt(day, 10),
      ),
      error: false,
    };
  };

  const formatDateEsES = (date: DateValue | null) => {
    return date
      ? new DateFormatter(locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone,
        }).format(date.toDate(timeZone))
      : "";
  };

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant={"range"}
        selectedDate={selectedDate}
        locale={locale}
        timeZone={timeZone}
        onSelectedDateChange={(newSelectedDate, error) => {
          console.log(
            `Selected date range: ${
              formatDateRange(newSelectedDate,
              locale,
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone,
              })
            }`,
          );
          setSelectedDate(newSelectedDate);
          const validationStatus =
            !error.startDate &&
            !error.endDate &&
            isValidDateRange(newSelectedDate)
              ? undefined
              : "error";
          setValidationStatus(validationStatus);
          args?.onSelectedDateChange?.(newSelectedDate, error);
        }}
      >
        <DatePickerRangeInput
          format={formatDateEsES}
          parse={parseDateEsES}
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
      onSelectedDateChange={(newSelectedDate, error) => {
        console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
        args?.onSelectedDateChange?.(newSelectedDate, error);
      }}
    >
      <DatePickerSingleInput bordered />
      <DatePickerOverlay>
        <DatePickerSinglePanel
          CalendarNavigationProps={{
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
      onSelectedDateChange={(newSelectedDate, error) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        args?.onSelectedDateChange?.(newSelectedDate, error);
      }}
    >
      <DatePickerRangeInput bordered />
      <DatePickerOverlay>
        <DatePickerRangePanel
          StartCalendarNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
          EndCalendarNavigationProps={{
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
  }) as RangeDatePickerState;

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
    setSelectedDate(newDateTime, { startDate: false, endDate: false });
  };
  const handleEndTimeChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
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
    setSelectedDate(newDateTime, { startDate: false, endDate: false });
  };

  const zonedStartTime = selectedDate?.startDate as ZonedDateTime;
  const zonedEndTime = selectedDate?.endDate as ZonedDateTime;
  return (
    <>
      <DatePickerRangeInput bordered />
      <input
        aria-label="start date time"
        type={"time"}
        value={
          zonedStartTime
            ? `${zonedStartTime.hour}:${zonedStartTime.minute}`
            : ""
        }
        onChange={handleStartTimeChange}
      />
      <input
        aria-label="end date time"
        type={"time"}
        value={
          zonedEndTime ? `${zonedEndTime.hour}:${zonedEndTime.minute}` : ""
        }
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
      defaultSelectedDate={{
        startDate: now(getLocalTimeZone()),
        endDate: now(getLocalTimeZone()),
      }}
      onSelectedDateChange={(newSelectedDate, error) => {
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
        args?.onSelectedDateChange?.(newSelectedDate, error);
      }}
    >
      <DatePickerTimeInput />
      <DatePickerOverlay>
        <DatePickerRangePanel
          StartCalendarNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
          EndCalendarNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
        />
      </DatePickerOverlay>
    </DatePicker>
  );
};

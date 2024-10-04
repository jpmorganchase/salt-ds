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
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
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

const DatePickerSingleTemplate: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <DatePicker
      selectionVariant="single"
      onSelectedDateChange={handleSelectedDateChange}
      {...args}
    >
      <DatePickerSingleInput />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

const DatePickerRangeTemplate: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <DatePicker
      selectionVariant="range"
      onSelectedDateChange={handleSelectedDateChange}
      {...args}
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

export const SingleControlled: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    defaultSelectedDate ?? null,
  );
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      setSelectedDate(newSelectedDate);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setSelectedDate],
  );

  return (
    <DatePicker
      selectionVariant={"single"}
      onSelectedDateChange={handleSelectedDateChange}
      {...args}
      selectedDate={selectedDate}
    >
      <DatePickerSingleInput />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const RangeControlled: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    defaultSelectedDate ?? null,
  );
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      setSelectedDate(newSelectedDate);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setSelectedDate],
  );

  return (
    <DatePicker
      selectionVariant="range"
      onSelectedDateChange={handleSelectedDateChange}
      {...args}
      selectedDate={selectedDate}
    >
      <DatePickerRangeInput />
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

export const SingleWithMinMaxDate: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const helperText = "Select date between 15/01/2030 and 15/01/2031";
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            defaultVisibleMonth={new CalendarDate(2030, 1, 1)}
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormFieldHelperText>{helperText}</FormFieldHelperText>
    </FormField>
  );
};

export const RangeWithMinMaxDate: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const helperText = "Select date between 15/01/2030 and 15/01/2031";
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <FormField>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const SingleWithInitialError: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const RangeWithInitialError: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      const validationStatus =
        !error.startDate && !error.endDate && isValidDateRange(newSelectedDate)
          ? undefined
          : "error";
      if (validationStatus === "error") {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(validationStatus);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        defaultSelectedDate={{ startDate: new CalendarDate(2024, 6, 9) }}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const SingleWithFormField: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const RangeWithFormField: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      const validationStatus =
        !error.startDate && !error.endDate && isValidDateRange(newSelectedDate)
          ? undefined
          : "error";
      setValidationStatus(validationStatus);
      if (validationStatus === "error") {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const SingleWithCustomPanel: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const minDate = today(getLocalTimeZone());
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        selectionVariant="single"
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const RangeWithCustomPanel: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const minDate = today(getLocalTimeZone());
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <FormField>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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
    <div style={{ display: "flex" }}>
      <Button
        style={{ margin: "var(--salt-spacing-50)", flexGrow: 1 }}
        sentiment="accented"
        appearance="bordered"
        onClick={() => setSelectedDate(today(getLocalTimeZone()), false)}
      >
        Select Today
      </Button>
    </div>
  );
};

export const SingleWithTodayButton: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <FormField>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerSinglePanel />
            </FlexItem>
            <FlexItem>
              <Divider />
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

export const SingleWithConfirmation: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onApply: onApplyProp,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    defaultSelectedDate ?? null,
  );
  const handleApply = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
      onApplyProp?.(newSelectedDate, error);
    },
    [onApplyProp, setSelectedDate, setHelperText],
  );
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      setSelectedDate(newSelectedDate);
      applyButtonRef?.current?.focus();
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, applyButtonRef?.current, setSelectedDate],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onApply={handleApply}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
        selectedDate={selectedDate}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerSinglePanel helperText={helperText} />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerActions
                selectionVariant="single"
                applyButtonRef={applyButtonRef}
              />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithConfirmation: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onApply: onApplyProp,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Select range (DD MMM YYYY - DD MMM YYYY) e.g. 09 Jun 2024";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const minDate = today(getLocalTimeZone());
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    defaultSelectedDate ?? null,
  );
  const handleApply = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: {
        startDate: string | false;
        endDate: string | false;
      },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      const validationStatus =
        !error.startDate && !error.endDate && isValidDateRange(newSelectedDate)
          ? undefined
          : "error";
      if (validationStatus === "error") {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(validationStatus);
      onApplyProp?.(newSelectedDate, error);
    },
    [onApplyProp, setValidationStatus, setHelperText],
  );
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: {
        startDate: string | false;
        endDate: string | false;
      },
    ) => {
      setSelectedDate(newSelectedDate);
      if (newSelectedDate?.startDate && newSelectedDate?.endDate) {
        applyButtonRef?.current?.focus();
      }
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [applyButtonRef?.current, onSelectedDateChangeProp, setSelectedDate],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        onApply={handleApply}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
        selectedDate={selectedDate}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerRangePanel helperText={helperText} />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerActions
                selectionVariant="range"
                applyButtonRef={applyButtonRef}
              />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithCustomParser: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    defaultSelectedDate ?? null,
  );
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      setSelectedDate(newSelectedDate);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [
      onSelectedDateChangeProp,
      setValidationStatus,
      setSelectedDate,
      setHelperText,
    ],
  );
  const customParser = useCallback(
    (inputDate: string, locale: string = getCurrentLocale()): DateInputSingleParserResult => {
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
    },
    [selectedDate],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
        selectedDate={selectedDate}
      >
        <DatePickerSingleInput parse={customParser} />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithLocaleEnUS: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const locale = "en-US";

  const defaultHelperText = `Locale ${locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${newSelectedDate}`);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        locale={locale}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const SingleWithLocaleZhCN: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const locale = "zh-CN";

  const defaultHelperText = `Locale ${locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${newSelectedDate ?? null}`);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setValidationStatus, setHelperText],
  );

  const formatMonth = (date: DateValue) =>
    formatDate(date, locale, {
      month: "long",
      day: undefined,
      year: undefined,
    });

  function renderDayContents(day: DateValue) {
    const formatter = new DateFormatter("en-US", { day: "numeric" });
    return <>{formatter.format(day.toDate(getLocalTimeZone()))}</>;
  }

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        locale={locale}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
      >
        <DatePickerSingleInput format={formatDate} />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            helperText={helperText}
            CalendarDataGridProps={{
              getCalendarMonthProps: (date) => ({ renderDayContents }),
            }}
            CalendarNavigationProps={{ formatMonth }}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithLocaleEsES: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const locale = "es-ES";

  const defaultHelperText = `Locale ${locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: {
        startDate: string | false;
        endDate: string | false;
      },
    ) => {
      console.log(
        `Selected date range: ${formatDateRange(newSelectedDate, locale, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}`,
      );
      const validationStatus =
        !error.startDate && !error.endDate && isValidDateRange(newSelectedDate)
          ? undefined
          : "error";
      if (validationStatus === "error") {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(validationStatus);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp, setValidationStatus, setHelperText],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"range"}
        locale={locale}
        onSelectedDateChange={handleSelectedDateChange}
        {...args}
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

export const SingleBordered: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const handleSelectedDateChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <DatePicker
      selectionVariant="single"
      onSelectedDateChange={handleSelectedDateChange}
      {...args}
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

export const RangeBordered: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: {
        startDate: string | false;
        endDate: string | false;
      },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <DatePicker
      selectionVariant="range"
      onSelectedDateChange={handleSelectedDateChange}
      {...args}
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

  const locale = "en-US";
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
            ? `${zonedStartTime.hour.toString().padStart(2, "0")}:${zonedStartTime.minute.toString().padStart(2, "0")}`
            : ""
        }
        onChange={handleStartTimeChange}
      />
      <input
        aria-label="end date time"
        type={"time"}
        value={
          zonedEndTime
            ? `${zonedEndTime.hour.toString().padStart(2, "0")}:${zonedEndTime.minute.toString().padStart(2, "0")}`
            : ""
        }
        onChange={handleEndTimeChange}
      />
    </>
  );
};
export const WithExperimentalTime: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectedDateChange: onSelectedDateChangeProp,
  ...args
}) => {
  const handleSelectedDateChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: {
        startDate: string | false;
        endDate: string | false;
      },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Use 24-hour format
      });
      const nativeStartTime =
        newSelectedDate?.startDate?.toDate(getLocalTimeZone()) ?? null;
      const nativeEndTime =
        newSelectedDate?.endDate?.toDate(getLocalTimeZone()) ?? null;
      console.log(
        `Selected time range: ${nativeStartTime ? timeFormatter.format(nativeStartTime) : null} - ${nativeEndTime ? timeFormatter.format(nativeEndTime) : null}`,
      );
      onSelectedDateChangeProp?.(newSelectedDate, error);
    },
    [onSelectedDateChangeProp],
  );

  return (
    <DatePicker
      selectionVariant="range"
      defaultSelectedDate={{
        startDate: now(getLocalTimeZone()),
        endDate: now(getLocalTimeZone()),
      }}
      onSelectedDateChange={handleSelectedDateChange}
      {...args}
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

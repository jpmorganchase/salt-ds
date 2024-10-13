import {
  CalendarDate,
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  isWeekend,
  now,
  today,
  type ZonedDateTime,
} from "@internationalized/date";
import {
  Button,
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DateInputErrorEnum,
  DateInputRangeDetails,
  DateInputSingleDetails,
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
  formatDate,
  getCurrentLocale,
  parseCalendarDate,
  type RangeDatePickerState,
  type SingleDatePickerState,
  type SingleDateSelection,
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
  date: DateValue | null | undefined,
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
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp],
  );

  return (
    <DatePicker
      selectionVariant="single"
      onSelectionChange={handleSelectionChange}
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
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const { startDate: startDateSelection, endDate: endDateSelection } =
        newSelection;
      const {
        date: startDate,
        value: startDateValue,
        errors: startDateErrors,
      } = startDateSelection;
      const {
        date: endDate,
        value: endDateValue,
        errors: endDateErrors,
      } = endDateSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp],
  );

  return (
    <DatePicker
      selectionVariant="range"
      onSelectionChange={handleSelectionChange}
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
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection | null | undefined
  >(defaultSelectedDate ?? null);
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp],
  );

  return (
    <DatePicker
      selectionVariant={"single"}
      onSelectionChange={handleSelectionChange}
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
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    defaultSelectedDate ?? null,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      setSelectedDate({ startDate, endDate });
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setSelectedDate],
  );

  return (
    <DatePicker
      selectionVariant="range"
      onSelectionChange={handleSelectionChange}
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
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Select date between 15/01/2030 and 15/01/2031";
  const errorHelperText = "Please enter an in-range date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            defaultVisibleMonth={new CalendarDate(2030, 1, 1)}
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithMinMaxDate: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Select date between 15/01/2030 and 15/01/2031";
  const errorHelperText = "Please enter an in-range date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      if (startDateErrors?.length && startDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
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
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithInitialError: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput defaultValue="bad date" />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithInitialError: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      if (startDateErrors?.length && startDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        defaultSelectedDate={{
          startDate: new CalendarDate(2024, 6, 9),
          endDate: null,
        }}
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerRangeInput
          defaultValue={{ startDate: "09 Jun 2024", endDate: "bad date" }}
        />
        <DatePickerOverlay>
          <DatePickerRangePanel
            helperText={helperText}
            defaultStartVisibleMonth={new CalendarDate(2024, 6, 1)}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithFormField: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithFormField: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      if (startDateErrors?.length && startDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <DatePickerRangePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithCustomPanel: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="single"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithCustomPanel: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      if (startDateErrors?.length && startDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="range"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

const TodayButton = () => {
  const {
    helpers: { select },
  } = useDatePickerContext({
    selectionVariant: "single",
  }) as SingleDatePickerState;

  return (
    <div style={{ display: "flex" }}>
      <Button
        style={{ margin: "var(--salt-spacing-50)", flexGrow: 1 }}
        sentiment="accented"
        appearance="bordered"
        onClick={() =>
          select({
            date: today(getLocalTimeZone()),
          })
        }
      >
        Select Today
      </Button>
    </div>
  );
};

export const SingleWithTodayButton: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <FormHelperText style={{ margin: "var(--salt-spacing-75)" }}>
                {helperText}
              </FormHelperText>
            </FlexItem>
            <FlexItem>
              <Divider />
            </FlexItem>
            <FlexItem>
              <DatePickerSinglePanel helperText={helperText} />
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
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithConfirmation: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onApply: onApplyProp,
  onCancel: onCancelProp,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [helperText, setHelperText] = useState<string>(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection | null | undefined
  >(defaultSelectedDate ?? null);

  const savedState = useRef<{
    validationStatus: typeof validationStatus;
    helperText: typeof helperText;
  }>({
    validationStatus: undefined,
    helperText: defaultHelperText,
  });

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      if (newSelectedDate) {
        applyButtonRef?.current?.focus();
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  const handleOpen = useCallback(
    (opening: boolean) => {
      if (opening) {
        savedState.current = {
          helperText,
          validationStatus,
        };
      }
      setOpen(opening);
    },
    [validationStatus, setOpen],
  );

  const handleCancel = useCallback(() => {
    onCancelProp?.();
    setValidationStatus(savedState.current?.validationStatus);
    setHelperText(savedState.current?.helperText);
  }, [onCancelProp, setHelperText, setValidationStatus]);

  const handleApply = useCallback(
    (newSelectedDate: SingleDateSelection | null | undefined) => {
      console.log(`Applied date: ${formatSingleDate(newSelectedDate)}`);
      setSelectedDate(newSelectedDate);
      onApplyProp?.(newSelectedDate);
      setHelperText(defaultHelperText);
      setValidationStatus(undefined);
    },
    [
      onApplyProp,
      applyButtonRef?.current,
      setHelperText,
      setSelectedDate,
      setValidationStatus,
    ],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onApply={handleApply}
        onCancel={handleCancel}
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={handleOpen}
        defaultSelectedDate={selectedDate}
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
                ApplyButtonProps={{
                  disabled: !!validationStatus,
                }}
              />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithConfirmation: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onApply: onApplyProp,
  onCancel: onCancelProp,
  onOpen: onOpenProp,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Select range (DD MMM YYYY - DD MMM YYYY) e.g. 09 Jun 2024";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const [helperText, setHelperText] = useState<string>(defaultHelperText);
  const [open] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<
    "error" | undefined
  >();
  const savedValidationState = useRef<typeof validationStatus>();

  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    defaultSelectedDate ?? null,
  );

  const savedState = useRef<{
    validationStatus: typeof validationStatus;
    helperText: typeof helperText;
  }>({
    validationStatus: undefined,
    helperText: defaultHelperText,
  });

  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      if (startDateErrors?.length && startDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  const handleOpen = useCallback(
    (opening: boolean) => {
      if (opening) {
        savedValidationState.current = validationStatus;
      }
    },
    [validationStatus],
  );

  const handleCancel = useCallback(() => {
    onCancelProp?.();
    setHelperText(savedState.current?.helperText);
    setValidationStatus(savedValidationState.current);
  }, [onCancelProp, setHelperText, setValidationStatus]);

  const handleApply = useCallback(
    (newSelectedDate: DateRangeSelection) => {
      console.log(`Applied date: ${formatDateRange(newSelectedDate)}`);
      setSelectedDate(newSelectedDate);
      onApplyProp?.(newSelectedDate);
      setHelperText(defaultHelperText);
      setValidationStatus(undefined);
    },
    [
      onApplyProp,
      applyButtonRef?.current,
      setHelperText,
      setSelectedDate,
      setValidationStatus,
    ],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        onApply={handleApply}
        onCancel={handleCancel}
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={handleOpen}
        defaultSelectedDate={selectedDate}
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
                ApplyButtonProps={{
                  disabled: !!validationStatus,
                }}
              />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithCustomParser: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null | undefined>(
    defaultSelectedDate ?? null,
  );
  const handleSelectionChange = useCallback(
    (details: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = details;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      setSelectedDate(newSelectedDate);
      onSelectionChangeProp?.(details);
    },
    [
      onSelectionChangeProp,
      setSelectedDate,
      setHelperText,
      setValidationStatus,
    ],
  );

  const customParser = useCallback(
    (
      inputDate: string,
      locale: string = getCurrentLocale(),
    ): DateInputSingleDetails => {
      if (!inputDate?.length) {
        return {
          date: null,
          errors: [
            { type: DateInputErrorEnum.UNSET, message: "no date provided" },
          ],
        };
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
        };
      }
      return parseCalendarDate(parsedDate || "", locale);
    },
    [selectedDate],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput parse={customParser} />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithCustomValidation: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  defaultSelectedDate,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText =
    "A weekday,in the format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const validateIsAWeekday = useCallback(
    (result: DateInputSingleDetails): DateInputSingleDetails => {
      if (
        result?.date &&
        isWeekend(result.date, getCurrentLocale())
      ) {
        result.errors = result.errors ?? [];
        result.errors?.push({
          type: DateInputErrorEnum.INVALID_DAY,
          message: "date must be a weekday",
        });
      }
      return result;
    },
    [],
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  const customiseNonDateError = useCallback(
    (result: DateInputSingleDetails): DateInputSingleDetails => {
      if (!result.errors) {
        return result;
      }
      result.errors = result.errors.map((error) => {
        console.log(error);
        if (error.type === DateInputErrorEnum.NOT_A_DATE) {
          error.message = "valid dates are any weekday";
        }
        return error;
      });
      return result;
    },
    [],
  );

  const isDayUnselectable = useCallback(
    (date: DateValue): string | false | undefined => {
      console.log(date);
      return isWeekend(date, getCurrentLocale())
        ? "weekends are un-selectable"
        : false;
    },
    [],
  );

  const validateAndCustomize = useCallback(
    (result: DateInputSingleDetails): DateInputSingleDetails => {
      const validateWeekdayResult = validateIsAWeekday(result);
      return customiseNonDateError(validateWeekdayResult);
    },
    [customiseNonDateError, validateIsAWeekday],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput validate={validateAndCustomize} />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            helperText={helperText}
            CalendarProps={{ isDayUnselectable }}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithLocaleEnUS: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const locale = "en-US";

  const defaultHelperText = `Locale ${locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        locale={locale}
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleWithLocaleZhCN: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const locale = "zh-CN";

  const defaultHelperText = `Locale ${locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
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
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput format={formatDate} />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            helperText={helperText}
            CalendarDataGridProps={{
              getCalendarMonthProps: () => ({ renderDayContents }),
            }}
            CalendarNavigationProps={{ formatMonth }}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeWithLocaleEsES: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const locale = "es-ES";

  const defaultHelperText = `Locale ${locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      if (startDateErrors?.length && startDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"range"}
        locale={locale}
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerRangeInput />
        <DatePickerOverlay>
          <DatePickerRangePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const SingleBordered: StoryFn<DatePickerSingleProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (newSelection: DateInputSingleDetails) => {
      const { date: newSelectedDate, value, errors } = newSelection;
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      if (errors?.length && value) {
        console.log(
          `Error(s): ${errors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (value) {
          console.log(`Current Value: ${value}`);
        }
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerSingleInput bordered />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            helperText={helperText}
            CalendarNavigationProps={{
              MonthDropdownProps: { bordered: true },
              YearDropdownProps: { bordered: true },
            }}
          />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

export const RangeBordered: StoryFn<DatePickerRangeProps> = ({
  selectionVariant,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      if (startDateErrors?.length && startDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp, setHelperText, setValidationStatus],
  );

  return (
    <FormField validationStatus={validationStatus}>
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        onSelectionChange={handleSelectionChange}
        {...args}
        onOpen={setOpen}
      >
        <DatePickerRangeInput bordered />
        <DatePickerOverlay>
          <DatePickerRangePanel
            helperText={helperText}
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
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

const DatePickerTimeInput: React.FC = () => {
  const {
    helpers: { select },
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

    select({
      startDate: { date: startDate },
      endDate: { date: selectedDate?.endDate },
    });
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

    select({
      startDate: { date: selectedDate?.startDate },
      endDate: { date: endDate },
    });
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
  onApply: onApplyProp,
  onSelectionChange: onSelectionChangeProp,
  ...args
}) => {
  const handleSelectionChange = useCallback(
    (newSelection: DateInputRangeDetails) => {
      const {
        startDate: {
          date: startDate,
          value: startDateValue,
          errors: startDateErrors,
        },
        endDate: {
          date: endDate,
          value: endDateValue,
          errors: endDateErrors,
        },
      } = newSelection;
      console.log(
        `Selected date range: ${formatDateRange({ startDate, endDate })}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type=${type} message=${message}`).join(",")}`,
        );
        if (startDateValue) {
          console.log(`Current Value: ${startDateValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type= ${type} message=${message}`).join(",")}`,
        );
        if (endDateValue) {
          console.log(`Current Value: ${endDateValue}`);
        }
      }
      onSelectionChangeProp?.(newSelection);
    },
    [onSelectionChangeProp],
  );

  const handleApply = useCallback(
    (newSelectedDate: DateRangeSelection) => {
      console.log(`Applied date: ${formatDateRange(newSelectedDate)}`);
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Use 24-hour format
      });
      const nativeStartTime =
        newSelectedDate.startDate?.toDate(getLocalTimeZone()) ?? null;
      const nativeEndTime =
        newSelectedDate.endDate?.toDate(getLocalTimeZone()) ?? null;
      console.log(
        `Applied time range: ${nativeStartTime ? timeFormatter.format(nativeStartTime) : null} - ${nativeEndTime ? timeFormatter.format(nativeEndTime) : null}`,
      );
      onApplyProp?.(newSelectedDate);
    },
    [onApplyProp],
  );

  return (
    <DatePicker
      selectionVariant="range"
      defaultSelectedDate={{
        startDate: now(getLocalTimeZone()),
        endDate: now(getLocalTimeZone()),
      }}
      onApply={handleApply}
      onSelectionChange={handleSelectionChange}
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

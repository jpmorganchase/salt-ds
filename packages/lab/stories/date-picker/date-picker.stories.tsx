import {
  DatePicker,
  DatePickerProps,
  RangeSelectionValueType,
  SingleSelectionValueType,
} from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { ChangeEvent, useState } from "react";
import {
  DateFormatter,
  DateValue,
  getLocalTimeZone,
} from "@internationalized/date";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

const isInvalidDate = (value: string) =>
  value && isNaN(new Date(value).getDay());

const getDateValidationStatus = (value: string | undefined) =>
  value && isInvalidDate(value) ? "error" : undefined;

const DatePickerTemplate: StoryFn<
  DatePickerProps<SingleSelectionValueType | RangeSelectionValueType>
> = (args) => {
  return <DatePicker {...args} />;
};
export const Default = DatePickerTemplate.bind({});
Default.args = {};

export const CustomFormat = DatePickerTemplate.bind({});
CustomFormat.args = {
  dateFormatter: (date: DateValue | undefined): string => {
    return date
      ? new DateFormatter("fr-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(date.toDate(getLocalTimeZone()))
      : "";
  },
  placeholder: "YYYY-MM-DD",
};

export const Range = DatePickerTemplate.bind({});
Range.args = {
  selectionVariant: "range",
};

export const VisibleMonths = DatePickerTemplate.bind({});
VisibleMonths.args = {
  selectionVariant: "range",
  visibleMonths: 1,
};

export const WithFormField: StoryFn<
  DatePickerProps<SingleSelectionValueType | RangeSelectionValueType>
> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2021)";

  return (
    <FormField style={{ width: "200px" }}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker {...args} helperText={helperText} />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const WithValidation: StoryFn<
  DatePickerProps<SingleSelectionValueType | RangeSelectionValueType>
> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2021)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined
  );
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<
    DateValue | { startDate?: DateValue; endDate?: DateValue } | undefined
  >(undefined);

  return (
    <FormField style={{ width: "200px" }} validationStatus={validationStatus}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker
        {...args}
        helperText={helperText}
        selectedDate={selectedDate}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setInputValue(event.target.value)
        }
        onSelectionChange={(_, date) => {
          const validationStatus = getDateValidationStatus(inputValue);
          setValidationStatus(validationStatus);
          if (!validationStatus) {
            setSelectedDate(date);
          }
        }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithValidation: StoryFn<
  DatePickerProps<RangeSelectionValueType>
> = (args) => {
  const helperText = "Select range (DD MMM YYYY - DD MMM YYYY)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<
    RangeSelectionValueType | undefined
  >(undefined);
  const [startString, setStartString] = useState<string | undefined>(undefined);
  const [endString, setEndString] = useState<string | undefined>(undefined);
  return (
    <FormField style={{ width: "250px" }} validationStatus={validationStatus}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker
        {...args}
        helperText={helperText}
        selectionVariant="range"
        selectedDate={selectedDate}
        onChange={(
          event: ChangeEvent<HTMLInputElement>,
          startDateInputValue?: string,
          endDateInputValue?: string
        ) => {
          setStartString(startDateInputValue);
          setEndString(endDateInputValue);
        }}
        onSelectionChange={(_, date) => {
          const validationStatus =
            getDateValidationStatus(startString) ??
            getDateValidationStatus(endString);

          setValidationStatus(validationStatus);
          if (!validationStatus) {
            setSelectedDate(date as RangeSelectionValueType);
          }
        }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleControlled: StoryFn<
  DatePickerProps<SingleSelectionValueType | RangeSelectionValueType>
> = (args) => {
  const [selectedDate, setSelectedDate] = useState<DateValue | undefined>(
    undefined
  );
  return (
    <DatePicker
      {...args}
      selectedDate={selectedDate}
      onSelectionChange={(_, date) => setSelectedDate(date as DateValue)}
    />
  );
};

export const RangeControlled: StoryFn<
  DatePickerProps<RangeSelectionValueType>
> = (args) => {
  const [selectedDate, setSelectedDate] = useState<
    RangeSelectionValueType | undefined
  >(undefined);
  return (
    <DatePicker
      {...args}
      selectionVariant="range"
      selectedDate={selectedDate}
      onSelectionChange={(_, date) => {
        setSelectedDate(date as RangeSelectionValueType);
      }}
    />
  );
};

export const ControlledOpenOnEnter: StoryFn<
  DatePickerProps<SingleSelectionValueType | RangeSelectionValueType>
> = (args) => {
  // state
  const [open, setOpen] = useState(false);
  return (
    <DatePicker
      {...args}
      open={open}
      onKeyDown={(e) => {
        if (e.key === "Enter") setOpen(!open);
      }}
    />
  );
};

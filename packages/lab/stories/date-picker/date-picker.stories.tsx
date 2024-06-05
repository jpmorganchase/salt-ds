import { DatePicker, DatePickerProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import {
  FlexItem,
  FlowLayout,
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

const DatePickerTemplate: StoryFn<DatePickerProps> = (args) => {
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

export const WithFormField: StoryFn<DatePickerProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2021)";

  return (
    <FormField style={{ width: "200px" }}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker {...args} helperText={helperText} />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const WithValidation: StoryFn<DatePickerProps> = (args) => {
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
          setValidationStatus(getDateValidationStatus(inputValue));
          setSelectedDate(date);
        }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithValidation: StoryFn<DatePickerProps> = (args) => {
  const helperText = "Select a range (DD MMM YYYY - DD MMM YYYY)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined
  );
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<
    DateValue | { startDate?: DateValue; endDate?: DateValue } | undefined
  >({ startDate: undefined, endDate: undefined });

  return (
    <FormField style={{ width: "250px" }} validationStatus={validationStatus}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="range"
        helperText={helperText}
        selectedDate={selectedDate}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setInputValue(event.target.value)
        }
        onSelectionChange={(_, date) => {
          console.log(date);
          setValidationStatus(getDateValidationStatus(inputValue));
          setSelectedDate(date);
        }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

// Cases:
// single controlled
// range controlled
// single with form props
// range with form props
// controlled open on enter
//     if i do open controlled, trying to control with enter on input, then i can't give a setter to the button
// single validation
// range validation

export const SingleControlled: StoryFn<DatePickerProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState(undefined);
  return (
    <DatePicker
      {...args}
      selectedDate={selectedDate}
      onSelectionChange={(_, date) => setSelectedDate(date)}
    />
  );
};

export const RangeControlled: StoryFn<DatePickerProps> = (args) => {
  const [selectedDate, setSelectedDate] = useState<{
    startDate?: DateValue;
    endDate?: DateValue;
  }>(undefined);
  return (
    <DatePicker
      {...args}
      selectionVariant="range"
      selectedDate={selectedDate}
      onSelectionChange={(_, date) => setSelectedDate(date)}
    />
  );
};

export const ControlledOpenOnEnter: StoryFn<DatePickerProps> = (args) => {
  // state
  const [open, setOpen] = useState(false);
  return (
    <DatePicker
      {...args}
      open={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !open) setOpen(open);
      }}
    />
  );
};

export const RangeValidation: StoryFn<DatePickerProps> = (args) => {
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined
  );
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<{
    startDate?: DateValue;
    endDate?: DateValue;
  }>(undefined);
  const helperText = "Select a range (DD MMM YYYY - DD MMM YYYY)";

  return (
    <FormField style={{ width: "200px" }} validationStatus={validationStatus}>
      <FormLabel>Pick a date range</FormLabel>
      <DatePicker
        {...args}
        selectionVariant="range"
        selectedDate={selectedDate}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setInputValue(event.target.value);
        }}
        onSelectionChange={(_, date) => {
          console.log(date);
          setValidationStatus(getDateValidationStatus(inputValue));
          setSelectedDate(date);
        }}
        helperText={helperText}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

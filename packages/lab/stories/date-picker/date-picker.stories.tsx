import { DatePicker, DatePickerProps } from "@salt-ds/lab";
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

export const CompactRange = DatePickerTemplate.bind({});
CompactRange.args = {
  selectionVariant: "range",
  isCompact: true,
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

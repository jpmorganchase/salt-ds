import { DatePicker, DatePickerProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { useState } from "react";
import { DateValue } from "@internationalized/date";

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

export const Range = DatePickerTemplate.bind({});
Range.args = {
  selectionVariant: "range",
};

export const WithFormField: StoryFn<DatePickerProps> = (args) => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2021)";
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined
  );
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<
    | DateValue
    | {
        startDate?: DateValue;
        endDate?: DateValue;
      }
    | undefined
  >(undefined);

  return (
    <FormField style={{ width: "200px" }} validationStatus={validationStatus}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker
        {...args}
        selectedDate={selectedDate}
        validationStatus={validationStatus}
        onChange={(event) => setInputValue(event.target.value)}
        onSelectionChange={(event, date) => {
          setValidationStatus(getDateValidationStatus(inputValue));
          setSelectedDate(date);
        }}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

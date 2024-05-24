import { DatePicker, DatePickerProps } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { SyntheticEvent, useState } from "react";

export default {
  title: "Lab/Date Picker",
  component: DatePicker,
} as Meta<typeof DatePicker>;

const isInvalidDate = (value: string) =>
  // @ts-ignore evaluating validity of date
  value && isNaN(new Date(value));

const getDateValidationStatus = (value: string | undefined) =>
  value && isInvalidDate(value) ? "error" : undefined;

const DatePickerTemplate: StoryFn<DatePickerProps> = (args) => {
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined
  );
  const validateStringDate = (_: SyntheticEvent, dateString: string) => {
    setValidationStatus(getDateValidationStatus(dateString));
  };

  return (
    <DatePicker
      {...args}
      validationStatus={validationStatus}
      onSelectionChange={() => {
        setValidationStatus(undefined);
      }}
      onInputValueChange={validateStringDate}
    />
  );
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
    "error"
  );

  const validateStringDate = (_: SyntheticEvent, dateString: string) => {
    setValidationStatus(getDateValidationStatus(dateString));
  };

  return (
    <FormField style={{ width: "200px" }} validationStatus={validationStatus}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker
        {...args}
        helperText={helperText}
        onSelectionChange={() => {
          setValidationStatus(undefined);
        }}
        onInputValueChange={validateStringDate}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

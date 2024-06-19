import { ChangeEvent, ReactElement, useState } from "react";
import { DatePicker } from "@salt-ds/lab";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { DateValue } from "@internationalized/date";
const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2021)";
const isInvalidDate = (value: string) =>
  value && isNaN(new Date(value).getDay());
const getDateValidationStatus = (value: string | undefined) =>
  value && isInvalidDate(value) ? "error" : undefined;
export const WithValidation = (): ReactElement => {
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
        selectedDate={selectedDate}
        validationStatus={validationStatus}
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

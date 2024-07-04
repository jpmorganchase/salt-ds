import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import {
  DatePicker,
  DatePickerRangePanel,
  RangeSelectionValueType,
} from "@salt-ds/lab";
import { FormField, FormFieldLabel as FormLabel } from "@salt-ds/core";

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
    RangeSelectionValueType | undefined
  >(undefined);

  return (
    <FormField style={{ width: "200px" }} validationStatus={validationStatus}>
      <FormLabel>Pick a date</FormLabel>
      <DatePicker
        selectionVariant="range"
        selectedDate={selectedDate}
        validationStatus={validationStatus}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setInputValue(event.target.value)
        }
        onSelectedDateChange={(
          _: SyntheticEvent,
          date: RangeSelectionValueType | undefined
        ) => {
          const validationStatus = getDateValidationStatus(inputValue);
          setValidationStatus(validationStatus);
          if (!validationStatus) {
            setSelectedDate(date);
          }
        }}
      >
        <DatePickerRangePanel helperText={helperText} />
      </DatePicker>
    </FormField>
  );
};

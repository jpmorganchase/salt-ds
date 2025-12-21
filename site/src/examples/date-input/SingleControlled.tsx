import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  DateInputSingle,
  type DateInputSingleProps,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const SingleControlled = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] =
    useState<SingleDateSelection<DateFrameworkType> | null>(null);
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleDateChange: DateInputSingleProps["onDateChange"] = (
    _event,
    date,
    details,
  ) => {
    const { value, errors } = details || {};
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    if (errors?.length) {
      console.log(
        `Error(s): ${errors
          .map(({ type, message }) => `type=${type} message=${message}`)
          .join(",")}`,
      );
      if (value) {
        console.log(`Original Value: ${value}`);
      }
    }
    if (errors?.length && details?.value?.length) {
      setHelperText(`${errorHelperText} - ${errors[0].message}`);
      setValidationStatus("error");
    } else {
      setHelperText(defaultHelperText);
      setValidationStatus(undefined);
    }
    setSelectedDate(date ?? null);
  };

  return (
    <FormField style={{ width: "250px" }} validationStatus={validationStatus}>
      <FormLabel>Enter a date</FormLabel>
      <DateInputSingle date={selectedDate} onDateChange={handleDateChange} />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

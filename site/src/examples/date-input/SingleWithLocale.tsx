import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  DateInputSingle,
  type DateInputSingleProps,
  LocalizationProvider,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import { es as dateFnsEs } from "date-fns/locale";
import { type ReactElement, useState } from "react";

const Single = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    dateAdapter.parse("23 ago 2025", "DD MMM YYYY").date,
  );
  const defaultHelperText = "Aug will be invalid and ago will be valid";
  const errorHelperText = "Please enter a valid ES date in DD MMM YYYY format";
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
      <FormLabel>Enter ES locale date</FormLabel>
      <DateInputSingle
        date={selectedDate}
        format={"DD MMM YYYY"}
        onDateChange={handleDateChange}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const SingleWithLocale = (): ReactElement => {
  return (
    <LocalizationProvider DateAdapter={AdapterDateFns} locale={dateFnsEs}>
      <Single />
    </LocalizationProvider>
  );
};

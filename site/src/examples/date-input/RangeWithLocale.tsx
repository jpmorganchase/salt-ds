import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  DateInputRange,
  type DateInputRangeProps,
  type DateRangeSelection,
  LocalizationProvider,
  useLocalization,
} from "@salt-ds/lab";
import { es as dateFnsEs } from "date-fns/locale";
import { type ReactElement, useState } from "react";

const Range = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Aug will be invalid and ago will be valid";
  const errorHelperText = "Please enter a valid ES date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const handleDateChange: DateInputRangeProps["onDateChange"] = (
    _event,
    date,
    details,
  ) => {
    const { startDate, endDate } = date ?? {};
    const {
      startDate: {
        value: startDateOriginalValue = undefined,
        errors: startDateErrors = undefined,
      } = {},
      endDate: {
        value: endDateOriginalValue = undefined,
        errors: endDateErrors = undefined,
      } = {},
    } = details || {};
    console.log(
      `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
    );
    if (startDateErrors?.length) {
      console.log(
        `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
      );
      if (startDateOriginalValue) {
        console.log(`StartDate Original Value: ${startDateOriginalValue}`);
      }
    }
    if (endDateErrors?.length) {
      console.log(
        `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
      );
      if (endDateOriginalValue) {
        console.log(`EndDate Original Value: ${endDateOriginalValue}`);
      }
    }
    setSelectedDate({
      startDate: startDateOriginalValue?.trim().length === 0 ? null : startDate,
      endDate: endDateOriginalValue?.trim().length === 0 ? null : endDate,
    });
    if (startDateErrors?.length && startDateOriginalValue) {
      setValidationStatus("error");
      setHelperText(
        `${errorHelperText} - start date ${startDateErrors[0].message}`,
      );
    } else if (endDateErrors?.length && endDateOriginalValue) {
      setValidationStatus("error");
      setHelperText(
        `${errorHelperText} - end date ${endDateErrors[0].message}`,
      );
    } else {
      setValidationStatus(undefined);
      setHelperText(defaultHelperText);
    }
  };

  return (
    <FormField style={{ width: "250px" }} validationStatus={validationStatus}>
      <FormLabel>Enter ES locale date range</FormLabel>
      <DateInputRange
        date={selectedDate}
        format={"DD MMM YYYY"}
        onDateChange={handleDateChange}
      />
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

export const RangeWithLocale = (): ReactElement => {
  return (
    <LocalizationProvider DateAdapter={AdapterDateFns} locale={dateFnsEs}>
      <Range />
    </LocalizationProvider>
  );
};

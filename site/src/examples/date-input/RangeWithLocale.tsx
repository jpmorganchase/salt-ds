import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  DateInputRange,
  type DateInputRangeProps,
  LocalizationProvider,
  useLocalization,
} from "@salt-ds/lab";
import { es as dateFnsEs } from "date-fns/locale";
import type { ReactElement } from "react";

const Range = (): ReactElement => {
  const { dateAdapter } = useLocalization();
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
  };

  return (
    <FormField style={{ width: "250px" }}>
      <FormFieldLabel>Enter ES locale date range</FormFieldLabel>
      <DateInputRange
        bordered
        onDateChange={handleDateChange}
        format={"DD MMM YYYY"}
        defaultValue={{ startDate: "23 ago 2025", endDate: "24 ago 2025" }}
      />
      <FormFieldHelperText>
        Aug will be invalid and ago will be valid
      </FormFieldHelperText>
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

import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { type ReactElement, type SyntheticEvent, useCallback } from "react";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  DateInputSingle,
  type DateInputSingleDetails,
  LocalizationProvider,
  useLocalization,
} from "@salt-ds/lab";
import { FormField, FormFieldLabel, FormFieldHelperText } from "@salt-ds/core";
import { es as dateFnsEs } from "date-fns/locale";

const Single = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  function handleDateChange<TDate extends DateFrameworkType>(
    _event: SyntheticEvent,
    date: TDate | null,
    details: DateInputSingleDetails,
  ) {
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    const { value, errors } = details;
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
  }
  return (
    <FormField style={{ width: "250px" }}>
      <FormFieldLabel>Enter ES locale date</FormFieldLabel>
      <DateInputSingle
        onDateChange={handleDateChange}
        format={"DD MMM YYYY"}
        defaultValue={"23 ago 2025"}
      />
      <FormFieldHelperText>Aug will be invalid and ago will be valid</FormFieldHelperText>
    </FormField>
  );
};

export const SingleWithLocale = (): ReactElement => {
  return (
    <LocalizationProvider DateAdapter={AdapterDateFns} locale={dateFnsEs}>
      <Single/>
    </LocalizationProvider>
  );
};

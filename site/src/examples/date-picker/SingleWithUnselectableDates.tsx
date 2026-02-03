import { FormField, FormFieldLabel as FormLabel } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  type DateInputSingleDetails,
  DatePicker,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/lab";
import type { Dayjs } from "dayjs";
import type { DateTime } from "luxon";
import type { Moment } from "moment/moment";
import type { ReactElement } from "react";
import { type SyntheticEvent, useCallback, useState } from "react";

export const SingleWithUnselectableDates = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "A weekday, in the format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      date: SingleDateSelection | null,
      details: DateInputSingleDetails | undefined,
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
    },
    [dateAdapter],
  );

  const isDayUnselectable = (day: DateFrameworkType) => {
    let dayOfWeek: number;

    if (dateAdapter.lib === "luxon") {
      // Luxon: 1 (Monday) to 7 (Sunday)
      dayOfWeek = (day as DateTime).weekday;
    } else if (dateAdapter.lib === "moment") {
      // Moment: 0 (Sunday) to 6 (Saturday)
      dayOfWeek = (day as Moment).day();
    } else if (dateAdapter.lib === "dayjs") {
      // Day.js: 0 (Sunday) to 6 (Saturday)
      dayOfWeek = (day as Dayjs).day();
    } else {
      // date-fns: 0 (Sunday) to 6 (Saturday)
      dayOfWeek = (day as Date).getDay();
    }

    const isWeekend =
      dateAdapter.lib === "luxon"
        ? dayOfWeek === 6 || dayOfWeek === 7 // Saturday or Sunday
        : dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

    return isWeekend ? "weekends are un-selectable" : false;
  };

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        isDayUnselectable={isDayUnselectable}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSingleGridPanel helperText={helperText} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

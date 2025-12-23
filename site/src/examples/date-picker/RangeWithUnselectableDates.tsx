import { FormField, FormFieldLabel as FormLabel } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  type DateInputRangeDetails,
  DatePicker,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerRangeGridPanel,
  DatePickerRangeInput,
  DatePickerTrigger,
  type DateRangeSelection,
  useLocalization,
} from "@salt-ds/lab";
import type { Dayjs } from "dayjs";
import type { DateTime } from "luxon";
import type { Moment } from "moment/moment";
import type { ReactElement } from "react";
import { type SyntheticEvent, useCallback, useState } from "react";

export const RangeWithUnselectableDates = (): ReactElement => {
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
      date: DateRangeSelection | null,
      details: DateInputRangeDetails | undefined,
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
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date, ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date, ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
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
      <FormLabel>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        isDayUnselectable={isDayUnselectable}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangeGridPanel helperText={helperText} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

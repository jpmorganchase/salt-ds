import { FormField, FormFieldLabel as FormLabel, useId } from "@salt-ds/core";
import type { ParserResult } from "@salt-ds/date-adapters";
import {
  type DateInputSingleDetails,
  DatePicker,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerTrigger,
  MonthYearSinglePanel,
  type SingleDateSelection,
  useLocalization,
} from "@salt-ds/date-components";
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

const MONTH_YEAR_FORMATS = [
  "MMMM YYYY",
  "MMM YYYY",
  "MM/YYYY",
  "MM YYYY",
  "M/YYYY",
  "M YYYY",
];

export const SingleWithMonthYearPanel = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText = "Select a month and year (e.g. January 2026)";
  const errorHelperText =
    "Please enter a valid month and year (e.g. January 2026)";
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
        `Selected month: ${dateAdapter.isValid(date) ? dateAdapter.format(date, format) : date}`,
      );
      if (errors?.length && details?.value?.length) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      if (value) {
        console.log(`Original Value: ${value}`);
      }
    },
    [dateAdapter],
  );

  const parseMonthYear = useCallback(
    (inputDate: string, inputFormat: string): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          return {
            ...result,
            date: dateAdapter.startOf(result.date, "month"),
            value,
          };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const labelId = useId();

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYear}
            placeholder="Month Year"
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearSinglePanel />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

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

export const SingleWithMonthYearPanelMinMaxDate = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month between April 2026 and October 2028";
  const errorHelperText =
    "Please enter a month within the allowed range (e.g. June 2026)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      _date: SingleDateSelection | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { errors } = details || {};
      if (errors?.length && details?.value?.length) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
    },
    [],
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

  const minDate =
    dateAdapter.parse("01/04/2026", "DD/MM/YYYY").date ?? undefined;
  const maxDate =
    dateAdapter.parse("31/10/2028", "DD/MM/YYYY").date ?? undefined;

  const labelId = useId();

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month</FormLabel>
      <DatePicker
        selectionVariant="single"
        minDate={minDate}
        maxDate={maxDate}
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
          <MonthYearSinglePanel defaultVisibleYear={2026} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

import { FormField, FormFieldLabel as FormLabel, useId } from "@salt-ds/core";
import type { DateFrameworkType, ParserResult } from "@salt-ds/date-adapters";
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

export const SingleWithMonthYearPanelUnselectableMonths = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month, excluding July, August and September";
  const errorHelperText =
    "Please enter a selectable month (not July, August or September)";
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

  const isMonthUnselectable = useCallback(
    (month: DateFrameworkType) => {
      // `getMonth` is 0-based across all supported adapters.
      const monthIndex = dateAdapter.getMonth(month);
      const isQ3 = monthIndex === 6 || monthIndex === 7 || monthIndex === 8;
      return isQ3 ? "Q3 months are unavailable" : false;
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
          <MonthYearSinglePanel isMonthUnselectable={isMonthUnselectable} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

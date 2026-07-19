import { FormField, FormFieldLabel as FormLabel, useId } from "@salt-ds/core";
import type { DateFrameworkType, ParserResult } from "@salt-ds/date-adapters";
import {
  type DateInputRangeDetails,
  DateParserField,
  DatePicker,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerTrigger,
  type DateRangeSelection,
  MonthYearRangePanel,
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

export const RangeWithMonthYearPanelUnselectableMonths = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month range, excluding July, August and September";
  const errorHelperText =
    "Please enter selectable months (not July, August or September)";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );

  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      _date: DateRangeSelection | null,
      details: DateInputRangeDetails | undefined,
    ) => {
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
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start month, ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end month, ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
    },
    [],
  );

  const parseMonthYearRange = useCallback(
    (
      inputDate: string,
      field: DateParserField,
      inputFormat: string,
    ): ParserResult => {
      const value = (inputDate ?? "").trim();
      if (!value.length) {
        return dateAdapter.parse("", inputFormat);
      }
      for (const candidate of [inputFormat, ...MONTH_YEAR_FORMATS]) {
        const result = dateAdapter.parse(value, candidate);
        if (result?.date && dateAdapter.isValid(result.date)) {
          const normalised =
            field === DateParserField.END
              ? dateAdapter.endOf(result.date, "month")
              : dateAdapter.startOf(result.date, "month");
          return { ...result, date: normalised, value };
        }
      }
      return dateAdapter.parse(value, inputFormat);
    },
    [dateAdapter],
  );

  const isMonthUnselectable = useCallback(
    (month: DateFrameworkType) => {
      const monthIndex = dateAdapter.getMonth(month);
      const isQ3 = monthIndex === 6 || monthIndex === 7 || monthIndex === 8;
      return isQ3 ? "Q3 months are unavailable" : false;
    },
    [dateAdapter],
  );

  const labelId = useId();

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month range</FormLabel>
      <DatePicker
        selectionVariant="range"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput
            aria-labelledby={labelId}
            format={format}
            parse={parseMonthYearRange}
            startInputProps={{ placeholder: "Month Year" }}
            endInputProps={{ placeholder: "Month Year" }}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <MonthYearRangePanel isMonthUnselectable={isMonthUnselectable} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

import { FormField, FormFieldLabel as FormLabel, useId } from "@salt-ds/core";
import type { ParserResult } from "@salt-ds/date-adapters";
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

export const RangeWithMonthYearPanelMinMaxDate = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const format = "MMMM YYYY";
  const defaultHelperText =
    "Select a month range between April 2026 and October 2028";
  const errorHelperText =
    "Please enter months within the allowed range (e.g. June 2026)";
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

  const minDate =
    dateAdapter.parse("01/04/2026", "DD/MM/YYYY").date ?? undefined;
  const maxDate =
    dateAdapter.parse("31/10/2028", "DD/MM/YYYY").date ?? undefined;

  const labelId = useId();

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a month range</FormLabel>
      <DatePicker
        selectionVariant="range"
        minDate={minDate}
        maxDate={maxDate}
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
          <MonthYearRangePanel
            defaultStartVisibleYear={2026}
            defaultEndVisibleYear={2028}
          />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

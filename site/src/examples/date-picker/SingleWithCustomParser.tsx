import { FormField, FormFieldLabel as FormLabel } from "@salt-ds/core";
import {
  DateDetailError,
  type DateFrameworkType,
  type ParserResult,
} from "@salt-ds/date-adapters";
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
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

export const SingleWithCustomParser = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Date format DD MMM YYYY (e.g. 09 Jun 2024) or +/-D (e.g. +7)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection | null | undefined
  >(null);
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
      setSelectedDate(date ?? null);
    },
    [dateAdapter],
  );

  const customParser = useCallback(
    (inputDate: string, format: string): ParserResult<DateFrameworkType> => {
      if (!inputDate?.length) {
        const parsedDate = dateAdapter.parse("invalid date", "DD/MMM/YYYY");
        return {
          date: parsedDate.date,
          value: inputDate,
          errors: [
            { type: DateDetailError.UNSET, message: "no date provided" },
          ],
        };
      }
      const parsedDate = inputDate;
      const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
      if (offsetMatch) {
        const offsetDays = Number.parseInt(offsetMatch[1], 10);
        let offsetDate = dateAdapter.isValid(selectedDate)
          ? selectedDate
          : dateAdapter.today();
        offsetDate = dateAdapter.add(offsetDate, { days: offsetDays });
        return {
          date: offsetDate,
          value: inputDate,
        };
      }
      return dateAdapter.parse(parsedDate || "", format);
    },
    [dateAdapter, selectedDate],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput parse={customParser} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSingleGridPanel helperText={helperText} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

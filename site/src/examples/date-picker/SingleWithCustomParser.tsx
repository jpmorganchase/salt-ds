import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DateDetailErrorEnum,
  type DateFrameworkType,
  type ParserResult,
} from "@salt-ds/date-adapters";
import {
  type DateInputSingleDetails,
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
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
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection<DateFrameworkType> | null | undefined
  >(null);
  const handleSelectionChange = useCallback(
    (
      event: SyntheticEvent,
      date: SingleDateSelection<DateFrameworkType> | null,
      details: DateInputSingleDetails | undefined,
    ) => {
      const { value, errors } = details || {};
      console.log(
        `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
      );
      if (errors?.length && value) {
        setHelperText(`${errorHelperText} - ${errors[0].message}`);
        setValidationStatus("error");
        console.log(
          `Error(s): ${errors
            .map(({ type, message }) => `type=${type} message=${message}`)
            .join(",")}`,
        );
        if (value) {
          console.log(`Original Value: ${value}`);
        }
      } else {
        setHelperText(defaultHelperText);
        setValidationStatus(undefined);
      }
      setSelectedDate(value?.trim().length === 0 ? null : date);
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  const customParser = useCallback(
    (
      inputDate: string,
      format: string,
      locale: any,
    ): ParserResult<DateFrameworkType> => {
      if (!inputDate?.length) {
        const parsedDate = dateAdapter.parse("invalid date", "DD/MMM/YYYY");
        return {
          date: parsedDate.date,
          value: inputDate,
          errors: [
            { type: DateDetailErrorEnum.UNSET, message: "no date provided" },
          ],
        };
      }
      const parsedDate = inputDate;
      const offsetMatch = parsedDate?.match(/^([+-]?\d+)$/);
      if (offsetMatch) {
        const offsetDays = Number.parseInt(offsetMatch[1], 10);
        let offsetDate = selectedDate ? selectedDate : dateAdapter.today();
        offsetDate = dateAdapter.add(offsetDate, { days: offsetDays });
        return {
          date: offsetDate,
          value: inputDate,
        };
      }
      return dateAdapter.parse(parsedDate || "", format, locale);
    },
    [dateAdapter, selectedDate],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput parse={customParser} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

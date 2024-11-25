import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
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
// As required by locale specific examples
import "dayjs/locale/en";
import { enUS as dateFnsEnUs } from "date-fns/locale";

export const SingleWithLocaleEnUS = (): ReactElement => {
  // Include any locales, required by your DateAdapter of choice.
  // Wrap in your own LocalizationProvider to specify the locale or modify the current context
  // <LocalizationProvider DateAdapter={DateAdapter} locale="en"></LocalizationProvider>
  const { dateAdapter } = useLocalization();
  const isDateFns = dateAdapter.lib === "date-fns";
  const isDayjs = dateAdapter.lib === "dayjs";
  if (isDateFns) {
    dateAdapter.locale = dateFnsEnUs;
  } else {
    dateAdapter.locale = "en";
  }
  const defaultHelperText = `Locale ${isDateFns ? dateAdapter.locale.code : dateAdapter.locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [open, setOpen] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
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
    },
    [dateAdapter, setHelperText, setValidationStatus],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        onSelectionChange={handleSelectionChange}
        onOpen={setOpen}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      {!open ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormField>
  );
};

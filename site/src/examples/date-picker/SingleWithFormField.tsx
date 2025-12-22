import { FormField, FormFieldLabel as FormLabel, useId } from "@salt-ds/core";
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

export const SingleWithFormField = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
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

  const labelId = useId();

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerSingleInput aria-labelledby={labelId} />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerSingleGridPanel helperText={helperText} />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

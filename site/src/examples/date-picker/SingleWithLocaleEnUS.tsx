import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
} from "@salt-ds/lab";
import { type ReactElement, useCallback, useState } from "react";

export const SingleWithLocaleEnUS = (): ReactElement => {
  const locale = "en-US";

  const defaultHelperText = `Locale ${locale}`;
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
    (newSelectedDate: SingleDateSelection | null, error: string | false) => {
      console.log(`Selected date: ${newSelectedDate}`);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
    },
    [setValidationStatus, setHelperText],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        locale={locale}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <DatePickerSinglePanel helperText={helperText} />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

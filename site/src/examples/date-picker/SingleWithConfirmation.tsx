import type { DateValue } from "@internationalized/date";
import {
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerActions,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDatePickerError,
  type SingleDateSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, useCallback, useRef, useState } from "react";

function formatSingleDate(
  date: DateValue | null | undefined,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
) {
  if (date) {
    return formatDate(date, locale, options);
  }
  return date;
}

export const SingleWithConfirmation = (): ReactElement => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const applyButtonRef = useRef<HTMLButtonElement>(null);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] = useState<
    SingleDateSelection | null | undefined
  >(null);
  const handleApply = useCallback(
    (
      newSelectedDate: SingleDateSelection | null | undefined,
      error: SingleDatePickerError,
    ) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      console.log(`Error: ${error}`);
      if (error) {
        setHelperText(errorHelperText);
      } else {
        setHelperText(defaultHelperText);
      }
      setValidationStatus(error ? "error" : undefined);
    },
    [setSelectedDate, setHelperText],
  );
  const handleSelectionChange = useCallback(
    (newSelectedDate: SingleDateSelection | null | undefined) => {
      setSelectedDate(newSelectedDate);
      applyButtonRef?.current?.focus();
    },
    [applyButtonRef?.current, setSelectedDate],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onApply={handleApply}
        onSelectionChange={handleSelectionChange}
        selectedDate={selectedDate}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <DatePickerSinglePanel helperText={helperText} />
              <Divider variant="tertiary" />
            </FlexItem>
            <FlexItem>
              <DatePickerActions
                selectionVariant="single"
                applyButtonRef={applyButtonRef}
              />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

import {
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  Button,
  Divider,
  FlexItem,
  FlexLayout,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDatePickerError,
  type SingleDatePickerState,
  type SingleDateSelection,
  formatDate,
  getCurrentLocale,
  useDatePickerContext,
} from "@salt-ds/lab";
import { type ReactElement, useCallback, useState } from "react";

const TodayButton = () => {
  const {
    helpers: { setSelectedDate },
  } = useDatePickerContext({
    selectionVariant: "single",
  }) as SingleDatePickerState;
  return (
    <div style={{ display: "flex" }}>
      <Button
        style={{ margin: "var(--salt-spacing-50)", flexGrow: 1 }}
        sentiment="accented"
        appearance="bordered"
        onClick={() => setSelectedDate(today(getLocalTimeZone()), false)}
      >
        Select Today
      </Button>
    </div>
  );
};

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

export const SingleWithTodayButton = (): ReactElement => {
  const defaultHelperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const handleSelectionChange = useCallback(
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
    [setValidationStatus, setHelperText],
  );

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant="single"
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <FlexLayout gap={0} direction="column">
            <FlexItem>
              <FormHelperText style={{ margin: "var(--salt-spacing-75)" }}>
                {helperText}
              </FormHelperText>
            </FlexItem>
            <FlexItem>
              <Divider />
            </FlexItem>
            <FlexItem>
              <DatePickerSinglePanel />
            </FlexItem>
            <FlexItem>
              <Divider />
            </FlexItem>
            <FlexItem>
              <TodayButton />
            </FlexItem>
          </FlexLayout>
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};

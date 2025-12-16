import { FormField, FormFieldLabel as FormLabel, useId } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  type DateInputRangeDetails,
  DatePicker,
  DatePickerHelperText,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  DatePickerTrigger,
  type DateRangeSelection,
  useLocalization,
} from "@salt-ds/lab";
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

export const RangeWithInitialError = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const defaultHelperText =
    "Select range DD MMM YYYY - DD MMM YYYY (e.g. 09 Jun 2024)";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(errorHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    "error",
  );
  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      date: DateRangeSelection<DateFrameworkType> | null,
      details: DateInputRangeDetails | undefined,
    ) => {
      const { startDate, endDate } = date ?? {};
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
      console.log(
        `StartDate: ${dateAdapter.isValid(startDate) ? dateAdapter.format(startDate, "DD MMM YYYY") : startDate}, EndDate: ${dateAdapter.isValid(endDate) ? dateAdapter.format(endDate, "DD MMM YYYY") : endDate}`,
      );
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors.map(({ type, message }) => `type: ${type} message: ${message}`).join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date, ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date, ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
    },
    [dateAdapter],
  );

  const defaultStartVisibleMonth =
    dateAdapter.parse("01/06/2024", "DD/MM/YYYY").date ?? dateAdapter.today();

  const labelId = useId();

  return (
    <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
      <FormLabel id={labelId}>Select a date range</FormLabel>
      <DatePicker
        selectionVariant="range"
        defaultSelectedDate={{
          startDate: dateAdapter.parse("09/06/2024", "DD/MM/YYYY").date,
          endDate: dateAdapter.parse("bad date", "DD MMM YYYY").date,
        }}
        onSelectionChange={handleSelectionChange}
      >
        <DatePickerTrigger>
          <DatePickerRangeInput
            aria-labelledby={labelId}
            defaultValue={{ startDate: "09 Jun 2024", endDate: "bad date" }}
          />
        </DatePickerTrigger>
        <DatePickerOverlay>
          <DatePickerRangePanel
            helperText={helperText}
            defaultStartVisibleMonth={defaultStartVisibleMonth}
          />
        </DatePickerOverlay>
        <DatePickerHelperText>{helperText}</DatePickerHelperText>
      </DatePicker>
    </FormField>
  );
};

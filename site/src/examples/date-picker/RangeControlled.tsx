import {
  type DateInputRangeDetails,
  DatePicker,
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

export const RangeControlled = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const handleSelectionChange = useCallback(
    (
      _event: SyntheticEvent,
      date: DateRangeSelection | null,
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
      setSelectedDate({
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      });
      if (startDateErrors?.length) {
        console.log(
          `StartDate Error(s): ${startDateErrors
            .map(({ type, message }) => `type: ${type} message: ${message}`)
            .join(",")}`,
        );
        if (startDateOriginalValue) {
          console.log(`StartDate Original Value: ${startDateOriginalValue}`);
        }
      }
      if (endDateErrors?.length) {
        console.log(
          `EndDate Error(s): ${endDateErrors
            .map(({ type, message }) => `type: ${type} message: ${message}`)
            .join(",")}`,
        );
        if (endDateOriginalValue) {
          console.log(`EndDate Original Value: ${endDateOriginalValue}`);
        }
      }
    },
    [dateAdapter],
  );

  return (
    <DatePicker
      selectionVariant="range"
      onSelectionChange={handleSelectionChange}
      selectedDate={selectedDate}
    >
      <DatePickerTrigger>
        <DatePickerRangeInput />
      </DatePickerTrigger>
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  DateInputRange,
  type DateInputRangeDetails,
  type DateRangeSelection,
  LocalizationProvider,
} from "@salt-ds/lab";
import { enUS as dateFnsEnUs } from "date-fns/locale";
import {
  type ReactElement,
  type SyntheticEvent,
  useCallback,
  useState,
} from "react";

export const MinMax = (): ReactElement => {
  // Create a 3 month range of selectable dates
  // biome-ignore lint/suspicious/noExplicitAny: any is more flexible for adding new date frameworks
  const dateAdapter = new AdapterDateFns(dateFnsEnUs as any);
  const defaultMinDate = dateAdapter.parse("01 Jan 1900", "DD MMM YYYY").date;
  const defaultMaxDate = dateAdapter.parse("01 Jan 2100", "DD MMM YYYY").date;
  const defaultHelperText =
    "Define the Calendar Min/Max date in DD MMM YYYY format";
  const errorHelperText = "Please enter a valid date in DD MMM YYYY format";
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [validationStatus, setValidationStatus] = useState<"error" | undefined>(
    undefined,
  );
  const [selectedDate, setSelectedDate] =
    useState<DateRangeSelection<DateFrameworkType> | null>({
      startDate: defaultMinDate,
      endDate: defaultMaxDate,
    });
  const handleDateChange = useCallback(
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
      setSelectedDate({
        startDate:
          startDateOriginalValue?.trim().length === 0 ? null : startDate,
        endDate: endDateOriginalValue?.trim().length === 0 ? null : endDate,
      });
      if (startDateErrors?.length && startDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - start date ${startDateErrors[0].message}`,
        );
      } else if (endDateErrors?.length && endDateOriginalValue) {
        setValidationStatus("error");
        setHelperText(
          `${errorHelperText} - end date ${endDateErrors[0].message}`,
        );
      } else {
        setValidationStatus(undefined);
        setHelperText(defaultHelperText);
      }
    },
    [],
  );

  return (
    <LocalizationProvider
      DateAdapter={AdapterDateFns}
      locale={dateFnsEnUs}
      minDate={selectedDate?.startDate ?? defaultMinDate}
      maxDate={selectedDate?.endDate ?? defaultMaxDate}
    >
      <FormField style={{ width: "256px" }} validationStatus={validationStatus}>
        <FormFieldLabel>Calendar's Min/Max Date Range</FormFieldLabel>
        <DateInputRange date={selectedDate} onDateChange={handleDateChange} />
        <FormFieldHelperText>{helperText}</FormFieldHelperText>
      </FormField>
      <Calendar selectionVariant="single">
        <CalendarNavigation />
        <CalendarWeekHeader />
        <CalendarGrid />
      </Calendar>
    </LocalizationProvider>
  );
};

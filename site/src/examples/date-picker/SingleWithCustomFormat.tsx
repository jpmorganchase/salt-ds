import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

function formatDate(
  dateValue: SingleDateSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateFormatter = new DateFormatter(locale, options);
  return dateValue
    ? dateFormatter.format(dateValue.toDate(getLocalTimeZone()))
    : "N/A";
}

export const SingleWithCustomFormat = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  return (
    <DatePicker
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: SingleDateSelection | null) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerSingleInput
        formatDate={(date: DateValue | null | undefined): string => {
          return date
            ? new DateFormatter("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(date.toDate(getLocalTimeZone()))
            : "";
        }}
        placeholder={"MM DD YYYY"}
      />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};

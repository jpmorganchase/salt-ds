import {
  DateInputRange,
  type DateInputRangeProps,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const RangeBordered = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const handleDateChange: DateInputRangeProps["onDateChange"] = (
    _event,
    date,
    details,
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
  };

  return (
    <div style={{ width: "250px" }}>
      <DateInputRange bordered onDateChange={handleDateChange} />
    </div>
  );
};

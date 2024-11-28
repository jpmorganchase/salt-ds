import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  DateInputSingle,
  type DateInputSingleDetails,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement, SyntheticEvent } from "react";

export const SingleBordered = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  function handleDateChange<TDate extends DateFrameworkType>(
    _event: SyntheticEvent,
    date: TDate | null,
    details: DateInputSingleDetails,
  ) {
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    const { value, errors } = details;
    if (errors?.length && value) {
      console.log(
        `Error(s): ${errors
          .map(({ type, message }) => `type=${type} message=${message}`)
          .join(",")}`,
      );
      if (value) {
        console.log(`Original Value: ${value}`);
      }
    }
  }
  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle onDateChange={handleDateChange} bordered />
    </div>
  );
};

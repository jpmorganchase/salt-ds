import {
  DateInputSingle,
  type DateInputSingleProps,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Single = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const handleDateChange: DateInputSingleProps["onDateChange"] = (
    _event,
    date,
    details,
  ) => {
    console.log(
      `Selected date: ${dateAdapter.isValid(date) ? dateAdapter.format(date, "DD MMM YYYY") : date}`,
    );
    const { value, errors } = details;
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
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputSingle onDateChange={handleDateChange} />
    </div>
  );
};

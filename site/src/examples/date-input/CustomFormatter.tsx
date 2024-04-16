import { ReactElement } from "react";
import { DateInput } from "@salt-ds/lab";

export const CustomFormatter = (): ReactElement => {
  const formatter = (input: string): string => {
    const date = new Date(input);
    // @ts-ignore evaluating validity of date
    return isNaN(date)
      ? input
      : new Intl.DateTimeFormat("en-US", {
          year: "numeric",
        }).format(date);
  };

  return (
    <DateInput
      placeholder="yyyy"
      dateFormatter={formatter}
      style={{ width: "256px" }}
    />
  );
};

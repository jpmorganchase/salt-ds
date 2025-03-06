import { RangeSlider } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const WithNonNumericValues = (): ReactElement => {
  const [value, setValue] = useState<[number, number]>([1, 3]);

  const daysOfTheWeek = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 7 },
  ];

  const getDayOfTheWeek = (value?: number) => {
    const day = daysOfTheWeek.find((day) => day.value === value);
    return day ? day.label : "";
  };

  return (
    <RangeSlider
      style={{ width: "500px" }}
      minLabel={"Monday"}
      maxLabel={"Sunday"}
      min={1}
      max={7}
      value={value}
      onChange={(e, value) => setValue(value)}
      format={getDayOfTheWeek}
      markers={daysOfTheWeek.map((day) => {
        return { value: day.value, label: day.label };
      })}
    />
  );
};

import { useResponsiveProp } from "@salt-ds/core";
import { Slider } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const WithNonNumericValues = (): ReactElement => {
  const [value, setValue] = useState<number>(3);

  const daysOfTheWeek = [
    { label: "Monday", shortLabel: "Mon", value: 1 },
    { label: "Tuesday", shortLabel: "Tue", value: 2 },
    { label: "Wednesday", shortLabel: "Wed", value: 3 },
    { label: "Thursday", shortLabel: "Thu", value: 4 },
    { label: "Friday", shortLabel: "Fri", value: 5 },
    { label: "Saturday", shortLabel: "Sat", value: 6 },
    { label: "Sunday", shortLabel: "Sun", value: 7 },
  ];

  const getDayOfTheWeek = (value?: number) => {
    const day = daysOfTheWeek.find((day) => day.value === value);
    return day ? day.label : "";
  };

  const responsiveLabels = useResponsiveProp(
    {
      xs: daysOfTheWeek.map((day) => ({
        value: day.value,
        label: day.shortLabel,
      })),
      lg: daysOfTheWeek.map((day) => ({ value: day.value, label: day.label })),
    },
    daysOfTheWeek.map((day) => ({ value: day.value, label: day.label })),
  );

  return (
    <Slider
      aria-label="With non-numeric values"
      style={{ width: "80%" }}
      min={1}
      max={7}
      value={value}
      onChange={(_e, value) => setValue(value)}
      format={getDayOfTheWeek}
      marks={responsiveLabels}
    />
  );
};

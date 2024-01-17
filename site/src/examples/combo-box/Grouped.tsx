import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import { ComboBoxNext, Option, OptionGroup } from "@salt-ds/lab";
import { citiesWithCountries } from "./exampleData";

export const Grouped = (): ReactElement => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const groupedOptions = citiesWithCountries
    .filter((city) =>
      city.value.trim().toLowerCase().includes(value.trim().toLowerCase())
    )
    .reduce((acc, option) => {
      const country = option.country;
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(option);
      return acc;
    }, {} as Record<string, typeof citiesWithCountries>);

  return (
    <ComboBoxNext
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
    >
      {Object.entries(groupedOptions).map(([country, options]) => (
        <OptionGroup label={country} key={country}>
          {options.map((option) => (
            <Option value={option.value} key={option.value}>
              {option.value}
            </Option>
          ))}
        </OptionGroup>
      ))}
    </ComboBoxNext>
  );
};

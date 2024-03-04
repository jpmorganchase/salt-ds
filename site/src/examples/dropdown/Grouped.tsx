import { ReactElement } from "react";
import { DropdownNext, Option, OptionGroup } from "@salt-ds/lab";
import { citiesWithCountries } from "./exampleData";

export const Grouped = (): ReactElement => {
  const groupedOptions = citiesWithCountries.reduce((acc, option) => {
    const country = option.country;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(option);
    return acc;
  }, {} as Record<string, typeof citiesWithCountries>);

  return (
    <DropdownNext style={{ width: "266px" }}>
      {Object.entries(groupedOptions).map(([country, options]) => (
        <OptionGroup label={country} key={country}>
          {options.map((option) => (
            <Option value={option.value} key={option.value} />
          ))}
        </OptionGroup>
      ))}
    </DropdownNext>
  );
};

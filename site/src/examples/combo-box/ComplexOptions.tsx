import { ChangeEvent, ReactElement, Suspense, useState } from "react";
import { ComboBoxNext, Option } from "@salt-ds/core";
import { LargeCity, largestCities } from "./exampleData";
import { LazyCountrySymbol } from "@salt-ds/countries";

const customMatchPattern = (
  input: { name: string; countryCode: string },
  filterValue: string
) => {
  return (
    input.name.toLowerCase().includes(filterValue.toLowerCase()) ||
    filterValue === input.countryCode
  );
};

function OptionWithCountrySymbol({ value }: { value: LargeCity }) {
  return (
    <Option value={value.name}>
      <LazyCountrySymbol aria-hidden code={value.countryCode} />
      {value.name}
    </Option>
  );
}

export const ComplexOptions = (): ReactElement => {
  const [filter, setFilter] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilter(value);
  };

  return (
    <Suspense fallback={null}>
      <ComboBoxNext style={{ width: "266px" }} onChange={handleChange}>
        {largestCities
          .filter((value) => customMatchPattern(value, filter))
          .map((value) => (
            <OptionWithCountrySymbol value={value} key={value.name} />
          ))}
      </ComboBoxNext>
    </Suspense>
  );
};

import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import { ComboBox, Option, StackLayout, Text } from "@salt-ds/core";
import { citiesWithCountries, CityWithCountry } from "./exampleData";
export const SecondaryLabel = (): ReactElement => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: CityWithCountry[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0].value);
    } else {
      setValue("");
    }
  };

  const options = citiesWithCountries.filter(
    (city) =>
      city.value.toLowerCase().includes(value.trim().toLowerCase()) ||
      city.country.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
      valueToString={(value) => value.value}
      placeholder="City"
    >
      {options.map((city) => (
        <Option key={city.value} value={city}>
          <StackLayout gap={0.5} align="start">
            <Text>{city.value}</Text>
            <Text color="secondary">{city.country}</Text>
          </StackLayout>
        </Option>
      ))}
    </ComboBox>
  );
};

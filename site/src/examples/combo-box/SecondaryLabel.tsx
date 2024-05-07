import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import { ComboBox, Label, Option, StackLayout, Text } from "@salt-ds/core";
import { largestCities, LargeCity } from "./exampleData";

export const SecondaryLabel = (): ReactElement => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: LargeCity[]
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0].name);
    } else {
      setValue("");
    }
  };

  const cities = largestCities.slice(0, 5);

  return (
    <ComboBox
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
      valueToString={(value) => value.name}
    >
      {cities
        .filter((city) =>
          city.name.toLowerCase().includes(value.trim().toLowerCase())
        )
        .map((city) => (
          <Option key={city.countryCode} value={city}>
            <StackLayout gap={0.25} align="start">
              <Text variant="primary">{city.name}</Text>
              <Label variant="secondary" >{city.countryCode}</Label>
            </StackLayout>
          </Option>
        ))}
    </ComboBox>
  );
};

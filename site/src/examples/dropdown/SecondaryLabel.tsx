import { ReactElement } from "react";
import { Dropdown, Option, StackLayout, Text } from "@salt-ds/core";
import { citiesWithCountries, CityWithCountry } from "./exampleData";

export const SecondaryLabel = (): ReactElement => {
  return (
    <Dropdown
      style={{ width: "266px" }}
      valueToString={(city: CityWithCountry) => city.value}
      placeholder="Secondary label example"
    >
      {citiesWithCountries.map((city) => (
        <Option key={city.value} value={city}>
          <StackLayout gap={0.25} align="start">
            <Text>{city.value}</Text>
            <Text color="secondary">{city.country}</Text>
          </StackLayout>
        </Option>
      ))}
    </Dropdown>
  );
};

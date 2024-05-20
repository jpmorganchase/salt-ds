import { ReactElement } from "react";
import { Dropdown, Option, StackLayout, Text } from "@salt-ds/core";
import { largestCities, LargeCity } from "./exampleData";

export const SecondaryLabel = (): ReactElement => {
  return (
    <Dropdown
      style={{ width: "266px" }}
      valueToString={(city: LargeCity) => city.name}
      placeholder="Secondary label example"
    >
      {largestCities.slice(0, 5).map((city) => (
        <Option key={city.countryCode} value={city}>
          <StackLayout gap={0.25} align="start">
            <Text>{city.name}</Text>
            <Text color="secondary">{city.countryCode}</Text>
          </StackLayout>
        </Option>
      ))}
    </Dropdown>
  );
};

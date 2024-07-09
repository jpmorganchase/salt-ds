import { Dropdown, Option } from "@salt-ds/core";
import type { ReactElement } from "react";
import { type LargeCity, largestCities } from "./exampleData";

/**
 * type LargeCity = {
 *   name: string;
 *   countryCode: CountryCode;
 * }
 */

export const ObjectValues = (): ReactElement => {
  return (
    <Dropdown<LargeCity>
      style={{ width: "266px" }}
      valueToString={(city) => city.name}
    >
      {largestCities.map((city) => (
        <Option value={city} key={city.name} />
      ))}
    </Dropdown>
  );
};

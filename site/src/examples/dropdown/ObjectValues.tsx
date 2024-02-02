import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/lab";
import { largestCities, LargeCity } from "./exampleData";

/**
 * type LargeCity = {
 *   name: string;
 *   countryCode: CountryCode;
 * }
 */

export const ObjectValues = (): ReactElement => {
  return (
    <DropdownNext<LargeCity> style={{ width: "266px" }}>
      {largestCities.map((city) => (
        <Option value={city} key={city.name}>
          {city.name}
        </Option>
      ))}
    </DropdownNext>
  );
};

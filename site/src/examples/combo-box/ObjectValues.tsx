import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import { ComboBoxNext, Option } from "@salt-ds/core";
import { largestCities, LargeCity } from "./exampleData";

/**
 * type LargeCity = {
 *   name: string;
 *   countryCode: CountryCode;
 * }
 */

export const ObjectValues = (): ReactElement => {
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

  return (
    <ComboBoxNext<LargeCity>
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
      valueToString={(value) => value.name}
    >
      {largestCities
        .filter((city) =>
          city.name.toLowerCase().includes(value.trim().toLowerCase())
        )
        .map((city) => (
          <Option value={city} key={city.name} />
        ))}
    </ComboBoxNext>
  );
};

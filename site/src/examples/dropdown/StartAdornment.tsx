import { Dropdown, Option } from "@salt-ds/core";
import { LocationIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";
import { largestCities } from "./exampleData";

export const StartAdornment = (): ReactElement => {
  return (
    <Dropdown
      aria-label="City"
      startAdornment={<LocationIcon aria-hidden />}
      style={{ width: "266px" }}
    >
      {largestCities.map(({ name }) => (
        <Option value={name} key={name} />
      ))}
    </Dropdown>
  );
};

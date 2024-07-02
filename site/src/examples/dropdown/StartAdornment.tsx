import { Dropdown, Option } from "@salt-ds/core";
import { LocationIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";
import { largestCities } from "./exampleData";

export const StartAdornment = (): ReactElement => {
  return (
    <Dropdown startAdornment={<LocationIcon />} style={{ width: "266px" }}>
      {largestCities.map(({ name }) => (
        <Option value={name} key={name} />
      ))}
    </Dropdown>
  );
};

import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/core";
import { largestCities } from "./exampleData";
import { LocationIcon } from "@salt-ds/icons";

export const StartAdornment = (): ReactElement => {
  return (
    <DropdownNext startAdornment={<LocationIcon />} style={{ width: "266px" }}>
      {largestCities.map(({ name }) => (
        <Option value={name} key={name} />
      ))}
    </DropdownNext>
  );
};

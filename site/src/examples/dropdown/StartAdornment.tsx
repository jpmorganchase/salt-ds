import { ReactElement } from "react";
import { DropdownNext, Option } from "@salt-ds/lab";
import { largestCities } from "./exampleData";
import { LocationIcon } from "@salt-ds/icons";

export const StartAdornment = (): ReactElement => {
  return (
    <DropdownNext startAdornment={<LocationIcon />} style={{ width: "266px" }}>
      {largestCities.map(({ name }) => (
        <Option value={name} key={name}>
          {name}
        </Option>
      ))}
    </DropdownNext>
  );
};

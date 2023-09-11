import { ReactElement, SyntheticEvent } from "react";
import { DropdownNext } from "@salt-ds/lab";
import { StateNames } from "./exampleData";

const handleSelect = (_event: SyntheticEvent, data: { value: string }) => {
  console.log("selected item", data.value);
};

export const DefaultSelected = (): ReactElement => (
  <DropdownNext source={StateNames} onSelect={handleSelect} />
);

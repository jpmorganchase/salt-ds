import { ReactElement, SyntheticEvent, useState } from "react";
import { DropdownNext } from "@salt-ds/lab";
import { StateNames } from "./exampleData";

export const Default = (): ReactElement => {
  const [selected, setSelected] = useState("");

  const handleSelect = (_event: SyntheticEvent, data: { value: string }) => {
    setSelected(data.value);
  };
  return <DropdownNext source={StateNames} onSelect={handleSelect} />;
};

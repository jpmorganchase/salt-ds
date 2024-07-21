import { Dropdown, Option } from "@salt-ds/core";
import { type SyntheticEvent, type ReactElement, useState } from "react";
import { shortColorData } from "./exampleData";

export const Controlled = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
  ) => {
    setSelected(newSelected);
  };

  return (
    <Dropdown
      selected={selected}
      onSelectionChange={handleSelectionChange}
      style={{ width: "256px" }}
    >
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  );
};

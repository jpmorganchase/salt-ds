import { ListBox, Option } from "@salt-ds/core";
import { type SyntheticEvent, type ReactElement, useState } from "react";
// refer to https://github.com/jpmorganchase/salt-ds/tree/main/site/src/examples/list-box/exampleData.ts
import { shortColorData } from "./exampleData";

export const Controlled = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (event: SyntheticEvent, newSelected: string[]) => {
    setSelected(newSelected);
  };

  return (
    <ListBox
      selected={selected}
      onSelectionChange={handleChange}
      style={{ width: "10em" }}
    >
      {shortColorData.slice(0, 5).map((color) => (
        <Option value={color} key={color} />
      ))}
    </ListBox>
  );
};

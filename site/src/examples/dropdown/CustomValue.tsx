import { ReactElement, useState } from "react";
import { Dropdown, DropdownProps, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const CustomValue = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelected(newSelected);
  };

  return (
    <Dropdown
      selected={selected}
      value={
        selected.length < 2 ? selected[0] : `${selected.length} items selected`
      }
      onSelectionChange={handleSelectionChange}
      multiselect
      style={{ width: "266px" }}
    >
      {shortColorData.map((color) => (
        <Option value={color} key={color} />
      ))}
    </Dropdown>
  );
};

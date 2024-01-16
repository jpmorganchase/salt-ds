import { ReactElement, useState } from "react";
import { DropdownNext, DropdownNextProps, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const CustomValue = (): ReactElement => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectionChange: DropdownNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setSelected(newSelected);
  };

  return (
    <DropdownNext
      selected={selected}
      value={
        selected.length < 2 ? selected[0] : `${selected.length} items selected`
      }
      onSelectionChange={handleSelectionChange}
      multiselect
      style={{ width: "266px" }}
    >
      {shortColorData.map((color) => (
        <Option value={color} key={color}>
          {color}
        </Option>
      ))}
    </DropdownNext>
  );
};

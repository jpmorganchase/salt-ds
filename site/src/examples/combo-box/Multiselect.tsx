import { ChangeEvent, ReactElement, useState } from "react";
import {
  ComboBoxNext,
  ComboBoxNextProps,
  Option,
  PillNext,
} from "@salt-ds/lab";
import { shortColorData } from "./exampleData";
import { FlowLayout, StackLayout } from "@salt-ds/core";

export const Multiselect = (): ReactElement => {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange: ComboBoxNextProps["onSelectionChange"] = (
    event,
    newSelected
  ) => {
    setValue("");
    setSelected(newSelected);
  };

  return (
    <StackLayout>
      <FlowLayout gap={0.5}>
        {selected.map((color) => (
          <PillNext key={color}>{color}</PillNext>
        ))}
      </FlowLayout>
      <ComboBoxNext
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
        multiselect
        style={{ width: "266px" }}
      >
        {shortColorData
          .filter((color) =>
            color.toLowerCase().includes(value.trim().toLowerCase())
          )
          .map((color) => (
            <Option value={color} key={color}>
              {color}
            </Option>
          ))}
      </ComboBoxNext>
    </StackLayout>
  );
};

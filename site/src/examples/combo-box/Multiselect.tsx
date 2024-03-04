import { ChangeEvent, ReactElement, useState } from "react";
import { ComboBoxNext, ComboBoxNextProps, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";
import { FlowLayout, StackLayout, Pill } from "@salt-ds/core";

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
          <Pill key={color}>{color}</Pill>
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
            <Option value={color} key={color} />
          ))}
      </ComboBoxNext>
    </StackLayout>
  );
};

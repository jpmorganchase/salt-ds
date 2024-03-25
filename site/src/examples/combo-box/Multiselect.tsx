import { ChangeEvent, ReactElement, useState } from "react";
import { ComboBox, ComboBoxProps, Option } from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const Multiselect = (): ReactElement => {
  const [value, setValue] = useState("");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange: ComboBoxProps["onSelectionChange"] = () => {
    setValue("");
  };

  return (
    <ComboBox
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
    </ComboBox>
  );
};

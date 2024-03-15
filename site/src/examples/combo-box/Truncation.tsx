import { ChangeEvent, ReactElement, useState } from "react";
import { ComboBoxNext, ComboBoxNextProps, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const Truncation = (): ReactElement => {
  const [value, setValue] = useState("");
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange: ComboBoxNextProps["onSelectionChange"] = () => {
    setValue("");
  };

  return (
    <ComboBoxNext
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      multiselect
      truncate
      defaultSelected={shortColorData.slice(0, 5)}
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
  );
};

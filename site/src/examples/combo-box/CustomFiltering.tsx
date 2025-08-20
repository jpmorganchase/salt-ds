import { ComboBox, type ComboBoxProps, Option } from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";
import { shortColorData } from "./exampleData";

export const CustomFiltering = (): ReactElement => {
  const [value, setValue] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
    setShowAll(false);
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    if (newSelected.length === 1) {
      setValue(newSelected[0]);
    } else {
      setValue("");
    }
  };

  const handleOpenChange: ComboBoxProps["onOpenChange"] = (
    _newOpen,
    reason,
  ) => {
    if (reason === "manual") {
      setShowAll(true);
    }
  };

  const filteredOptions = shortColorData.filter((state) =>
    state.toLowerCase().includes(value.trim().toLowerCase()),
  );

  const options = showAll ? shortColorData : filteredOptions;

  return (
    <ComboBox
      style={{ width: "266px" }}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      onOpenChange={handleOpenChange}
      value={value}
    >
      {options.map((color) => (
        <Option value={color} key={color} />
      ))}
    </ComboBox>
  );
};

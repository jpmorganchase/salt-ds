import { ComboBox, Option } from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";
import { shortColorData } from "./exampleData";

export const FreeText = (): ReactElement => {
  const [value, setValue] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    setSelectedValues(newSelected);
    setValue("");
  };

  return (
    <ComboBox
      multiselect
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
      onBlur={() => {
        setValue("");
      }}
    >
      {Array.from(new Set(shortColorData.concat(selectedValues)))
        .filter((state) =>
          state.toLowerCase().includes(value.trim().toLowerCase()),
        )
        .map((state) => (
          <Option value={state} key={state} />
        ))}
      {value && !shortColorData.includes(value) && (
        <Option value={value} key={value}>
          Add &quot;{value}&quot;
        </Option>
      )}
    </ComboBox>
  );
};

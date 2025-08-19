import { Button, ComboBox, Option } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";
import { shortColorData } from "./exampleData";

export const ClearSelection = (): ReactElement => {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    setSelected(newSelected);
    setValue("");
  };

  const filteredOptions = shortColorData.filter((data) =>
    data.toLowerCase().includes(value.trim().toLowerCase()),
  );

  const handleClear = () => {
    setValue("");
    setSelected([]);
  };

  return (
    <ComboBox
      multiselect
      selected={selected}
      onChange={handleChange}
      onSelectionChange={handleSelectionChange}
      value={value}
      style={{ width: "266px" }}
      endAdornment={
        (value || selected.length > 0) && (
          <Button
            onClick={handleClear}
            aria-label="Clear value"
            appearance="transparent"
          >
            <CloseIcon aria-hidden />
          </Button>
        )
      }
    >
      {filteredOptions.map((state) => (
        <Option value={state} key={state} />
      ))}
    </ComboBox>
  );
};

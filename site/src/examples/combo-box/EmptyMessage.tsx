import {
  ComboBox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Option,
} from "@salt-ds/core";
import {
  type ChangeEvent,
  type ReactElement,
  type SyntheticEvent,
  useState,
} from "react";
import { shortColorData } from "./exampleData";

export const EmptyMessage = (): ReactElement => {
  const [value, setValue] = useState("Yelloww"); // cspell:disable-line

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
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

  const filteredOptions = shortColorData.filter((color) =>
    color.toLowerCase().includes(value.trim().toLowerCase()),
  );

  return (
    <FormField style={{ width: "266px" }}>
      <FormFieldLabel>Color</FormFieldLabel>
      <ComboBox
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
        inputProps={{ "aria-autocomplete": "list" }}
        OverlayProps={{ "aria-label": "Colors" }}
      >
        {filteredOptions.map((color) => (
          <Option value={color} key={color} />
        ))}
      </ComboBox>
      <FormFieldHelperText role="status">
        {filteredOptions.length === 0
          ? `No results found for "${value}"`
          : `${filteredOptions.length} ${filteredOptions.length === 1 ? "color" : "colors"} available`}
      </FormFieldHelperText>
    </FormField>
  );
};

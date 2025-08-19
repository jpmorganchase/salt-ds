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

export const WithFormField = (): ReactElement => {
  const [value, setValue] = useState("");

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

  return (
    <FormField style={{ width: "266px" }}>
      <FormFieldLabel>Color</FormFieldLabel>
      <ComboBox
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
      >
        {shortColorData
          .filter((color) =>
            color.toLowerCase().includes(value.trim().toLowerCase()),
          )
          .map((color) => (
            <Option value={color} key={color} />
          ))}
      </ComboBox>
      <FormFieldHelperText>Pick a color</FormFieldHelperText>
    </FormField>
  );
};

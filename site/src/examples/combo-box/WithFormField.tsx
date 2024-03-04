import { ChangeEvent, ReactElement, SyntheticEvent, useState } from "react";
import { FormFieldHelperText, FormFieldLabel, FormField } from "@salt-ds/core";
import { ComboBoxNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const WithFormField = (): ReactElement => {
  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    event: SyntheticEvent,
    newSelected: string[]
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
      <ComboBoxNext
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
        value={value}
      >
        {shortColorData
          .filter((color) =>
            color.toLowerCase().includes(value.trim().toLowerCase())
          )
          .map((color) => (
            <Option value={color} key={color} />
          ))}
      </ComboBoxNext>
      <FormFieldHelperText>Pick a color</FormFieldHelperText>
    </FormField>
  );
};

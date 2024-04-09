import { ReactElement } from "react";
import {
  FormFieldHelperText,
  FormFieldLabel,
  FormField,
  Dropdown,
  Option,
} from "@salt-ds/core";
import { shortColorData } from "./exampleData";

export const WithFormField = (): ReactElement => {
  return (
    <FormField style={{ width: "266px" }}>
      <FormFieldLabel>Color</FormFieldLabel>
      <Dropdown>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </Dropdown>
      <FormFieldHelperText>Pick a color</FormFieldHelperText>
    </FormField>
  );
};

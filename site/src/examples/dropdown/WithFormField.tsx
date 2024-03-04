import { ReactElement } from "react";
import { FormFieldHelperText, FormFieldLabel, FormField } from "@salt-ds/core";
import { DropdownNext, Option } from "@salt-ds/lab";
import { shortColorData } from "./exampleData";

export const WithFormField = (): ReactElement => {
  return (
    <FormField style={{ width: "266px" }}>
      <FormFieldLabel>Color</FormFieldLabel>
      <DropdownNext>
        {shortColorData.map((color) => (
          <Option value={color} key={color} />
        ))}
      </DropdownNext>
      <FormFieldHelperText>Pick a color</FormFieldHelperText>
    </FormField>
  );
};

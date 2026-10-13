import { FormField, FormFieldLabel, Input } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Name</FormFieldLabel>
      <Input value={value} onChange={handleChange} />
    </FormField>
  );
};

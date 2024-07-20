import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const [value, setValue] = useState<string>("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedValue = event.target.value;
    setValue(updatedValue);
  };

  return (
    <RadioButtonGroup value={value} onChange={handleChange}>
      <RadioButton label="NAMR" value="namr" />
      <RadioButton label="APAC" value="apac" />
      <RadioButton label="EMEA" value="emea" />
    </RadioButtonGroup>
  );
};

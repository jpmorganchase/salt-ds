import { MultilineInput } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const [value, setValue] = useState<string>("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  return (
    <MultilineInput
      value={value}
      onChange={handleChange}
      style={{ width: "256px" }}
    />
  );
};

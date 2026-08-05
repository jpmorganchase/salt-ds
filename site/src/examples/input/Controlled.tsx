import { Input } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const [value, setValue] = useState("Value");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <Input
      inputProps={{ name: "example" }}
      value={value}
      onChange={handleChange}
      style={{ width: "256px" }}
    />
  );
};

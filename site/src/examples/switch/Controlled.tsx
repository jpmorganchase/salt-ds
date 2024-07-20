import { Switch } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const [checked, setChecked] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setChecked(updatedChecked);
  };

  return (
    <Switch label="Controlled" checked={checked} onChange={handleChange} />
  );
};

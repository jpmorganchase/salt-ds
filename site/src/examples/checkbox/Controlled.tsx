import { Checkbox, CheckboxGroup } from "@salt-ds/core";
import { type ChangeEvent, type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const updatedCheckedValues = checkedValues.includes(value)
      ? checkedValues.filter((checkedValue) => checkedValue !== value)
      : [...checkedValues, value];
    setCheckedValues(updatedCheckedValues);
  };

  return (
    <CheckboxGroup checkedValues={checkedValues} onChange={handleChange}>
      <Checkbox label="Alternatives" value="alternatives" />
      <Checkbox label="Equities" value="equities" />
      <Checkbox label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  );
};

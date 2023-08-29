import { ChangeEvent, ReactElement, useState } from "react";
import { Checkbox } from "@salt-ds/core";

export const Indeterminate = (): ReactElement => {
  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  return (
    <Checkbox
      checked={checkboxState.checked}
      indeterminate={checkboxState.indeterminate}
      label="Equities"
      onChange={handleChange}
    />
  );
};

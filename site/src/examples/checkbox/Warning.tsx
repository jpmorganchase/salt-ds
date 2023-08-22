import { ChangeEvent, ReactElement, useState } from "react";
import { Checkbox, CheckboxGroup, Button, StackLayout } from "@salt-ds/core";

export const Warning = (): ReactElement => {
  const [warningState, setWarningState] = useState(true);

  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setWarningState(false);
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  return (
    <StackLayout>
      <CheckboxGroup validationStatus={warningState ? "warning" : undefined}>
        <Checkbox
          onChange={() => setWarningState(false)}
          label="Alternatives"
        />
        <Checkbox
          onChange={() => setWarningState(false)}
          defaultChecked
          label="Equities"
        />
        <Checkbox
          checked={checkboxState.checked}
          indeterminate={checkboxState.indeterminate}
          onChange={handleChange}
          label="Fixed income"
        />
      </CheckboxGroup>
      <Button onClick={() => setWarningState(true)}>Reset</Button>
    </StackLayout>
  );
};

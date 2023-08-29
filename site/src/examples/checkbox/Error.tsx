import { ChangeEvent, ReactElement, useState } from "react";
import { Button, Checkbox, CheckboxGroup, StackLayout } from "@salt-ds/core";

export const Error = (): ReactElement => {
  const [errorState, setErrorState] = useState(true);

  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setErrorState(false);
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  return (
    <StackLayout>
      <CheckboxGroup validationStatus={errorState ? "error" : undefined}>
        <Checkbox onChange={() => setErrorState(false)} label="Alternatives" />
        <Checkbox
          onChange={() => setErrorState(false)}
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
      <Button onClick={() => setErrorState(true)}>Reset</Button>
    </StackLayout>
  );
};

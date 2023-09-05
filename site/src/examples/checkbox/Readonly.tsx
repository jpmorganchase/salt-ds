import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const Readonly = (): ReactElement => {
  return (
    <CheckboxGroup>
      <Checkbox readOnly label="Alternatives" />
      <Checkbox readOnly indeterminate label="Equities" />
      <Checkbox readOnly checked label="Fixed income" />
    </CheckboxGroup>
  );
};

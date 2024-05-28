import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const Readonly = (): ReactElement => {
  return (
    <CheckboxGroup name="fx">
      <Checkbox readOnly label="Alternatives" value="alternatives" />
      <Checkbox readOnly indeterminate label="Equities" value="equities" />
      <Checkbox readOnly checked label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  );
};

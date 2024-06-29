import { Checkbox, CheckboxGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Readonly = (): ReactElement => {
  return (
    <CheckboxGroup name="fx">
      <Checkbox readOnly label="Alternatives" value="alternatives" />
      <Checkbox readOnly indeterminate label="Equities" value="equities" />
      <Checkbox readOnly checked label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  );
};

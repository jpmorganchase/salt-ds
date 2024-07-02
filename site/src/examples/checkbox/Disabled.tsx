import { Checkbox, CheckboxGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => {
  return (
    <CheckboxGroup>
      <Checkbox disabled label="Alternatives" value="alternatives" />
      <Checkbox disabled indeterminate label="Equities" value="equities" />
      <Checkbox disabled checked label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  );
};

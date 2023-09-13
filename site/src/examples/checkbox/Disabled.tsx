import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const Disabled = (): ReactElement => {
  return (
    <CheckboxGroup>
      <Checkbox disabled label="Alternatives" />
      <Checkbox disabled indeterminate label="Equities" />
      <Checkbox disabled checked label="Fixed income" />
    </CheckboxGroup>
  );
};

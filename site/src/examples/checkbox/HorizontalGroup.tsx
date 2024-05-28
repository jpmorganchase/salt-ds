import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const HorizontalGroup = (): ReactElement => {
  return (
    <CheckboxGroup
      defaultCheckedValues={["alternatives", "equities"]}
      direction="horizontal"
      name="fx"
    >
      <Checkbox label="Alternatives" value="alternatives" />
      <Checkbox label="Equities" value="equities" />
      <Checkbox label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  );
};

import { Checkbox, CheckboxGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

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

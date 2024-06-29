import { Checkbox, CheckboxGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const VerticalGroup = (): ReactElement => {
  return (
    <CheckboxGroup defaultCheckedValues={["option-1", "option-2"]}>
      <Checkbox label="Alternatives" value="alternatives" />
      <Checkbox label="Equities" value="equities" />
      <Checkbox label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  );
};

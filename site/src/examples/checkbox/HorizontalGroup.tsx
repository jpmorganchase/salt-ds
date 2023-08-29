import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const HorizontalGroup = (): ReactElement => {
  return (
    <CheckboxGroup
      defaultCheckedValues={["option-1", "option-2"]}
      direction={"horizontal"}
    >
      <Checkbox label="Alternatives" value="option-1" />
      <Checkbox label="Equities" value="option-2" />
      <Checkbox label="Fixed income" value="option-3" />
    </CheckboxGroup>
  );
};

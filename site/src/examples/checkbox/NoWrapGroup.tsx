import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const NoWrapGroup = (): ReactElement => (
  <div
    style={{
      width: 250,
    }}
  >
    <CheckboxGroup name="fx" direction={"horizontal"} wrap={false}>
      <Checkbox key="option1" label="Alternatives" value="alternatives" />
      <Checkbox key="option2" label="Equities" value="equities" />
      <Checkbox
        disabled
        key="option3"
        label="Fixed income"
        value="fixed income"
      />
    </CheckboxGroup>
  </div>
);

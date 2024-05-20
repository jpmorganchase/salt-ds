import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const NoWrapGroup = (): ReactElement => (
  <div
    style={{
      width: 250,
    }}
  >
    <CheckboxGroup name="fx" direction="horizontal" wrap={false}>
      <Checkbox label="Alternatives" value="alternatives" />
      <Checkbox label="Equities" value="equities" />
      <Checkbox disabled label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  </div>
);

import { Checkbox, CheckboxGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const WrapGroup = (): ReactElement => (
  <div
    style={{
      width: 250,
    }}
  >
    <CheckboxGroup name="fx" direction="horizontal" wrap>
      <Checkbox label="Alternatives" value="alternatives" />
      <Checkbox label="Equities" value="equities" />
      <Checkbox disabled label="Fixed income" value="fixed income" />
    </CheckboxGroup>
  </div>
);

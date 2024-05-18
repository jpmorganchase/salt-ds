import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const NoWrap = (): ReactElement => (
  <div
    style={{
      width: 250,
    }}
  >
    <RadioButtonGroup name="region" direction="horizontal" wrap={false}>
      <RadioButton label="North America" value="namr" />
      <RadioButton label="Asia, Pacific" value="apac" />
      <RadioButton disabled label="Europe, Middle East, Africa" value="emea" />
    </RadioButtonGroup>
  </div>
);

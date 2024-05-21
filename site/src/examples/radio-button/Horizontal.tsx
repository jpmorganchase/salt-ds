import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const Horizontal = (): ReactElement => (
  <RadioButtonGroup direction="horizontal">
    <RadioButton label="NAMR" value="namr" />
    <RadioButton label="APAC" value="apac" />
    <RadioButton label="EMEA" value="emea" />
  </RadioButtonGroup>
);

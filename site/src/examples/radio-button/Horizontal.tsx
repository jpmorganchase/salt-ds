import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Horizontal = (): ReactElement => (
  <RadioButtonGroup direction="horizontal">
    <RadioButton label="NAMR" value="namr" />
    <RadioButton label="APAC" value="apac" />
    <RadioButton label="EMEA" value="emea" />
  </RadioButtonGroup>
);

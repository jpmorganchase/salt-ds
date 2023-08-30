import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const Default = (): ReactElement => (
  <RadioButtonGroup>
    <RadioButton key="option1" label="NAMR" value="option1" />
    <RadioButton key="option2" label="APAC" value="option2" />
    <RadioButton key="option3" label="EMEA" value="option3" />
  </RadioButtonGroup>
);

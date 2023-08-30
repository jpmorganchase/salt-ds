import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const Disabled = (): ReactElement => {
  return (
    <RadioButtonGroup disabled>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};

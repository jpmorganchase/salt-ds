import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => {
  return (
    <RadioButtonGroup disabled>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};

import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Readonly = (): ReactElement => {
  return (
    <RadioButtonGroup readOnly>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};

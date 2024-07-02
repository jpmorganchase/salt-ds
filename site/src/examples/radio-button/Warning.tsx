import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Warning = (): ReactElement => {
  return (
    <RadioButtonGroup validationStatus="warning">
      <RadioButton label="Warning" value="Warning-unchecked" />
      <RadioButton label="Warning" value="Warning-checked" checked />
    </RadioButtonGroup>
  );
};

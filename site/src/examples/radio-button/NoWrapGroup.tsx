import { ReactElement } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

export const NoWrapGroup = (): ReactElement => (
  <div
    style={{
      width: 250,
    }}
  >
    <RadioButtonGroup name="fx" direction={"horizontal"} wrap={false}>
      <RadioButton key="option1" label="North America" value="option1" />
      <RadioButton key="option2" label="Asia, Pacific" value="option2" />
      <RadioButton
        disabled
        key="option3"
        label="Europe, Middle East, Africa"
        value="option3"
      />
    </RadioButtonGroup>
  </div>
);

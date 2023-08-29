import { ReactElement } from "react";
import { Checkbox, CheckboxGroup } from "@salt-ds/core";

export const LongTextGroup = (): ReactElement => {
  const checkboxesData = [
    {
      label:
        "Checkboxes allow the user to select multiple options from a set. If you have multiple options appearing in a list, you can preserve space by using checkboxes instead of on/off switches. If you have a single option, avoid using a checkbox and use an on/off switch instead.",
      value: "checkboxes",
    },
    {
      label:
        "Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side.",
      value: "radio",
    },
    {
      disabled: true,
      label:
        "On/off switches toggle the state of a single settings option. The option that the switch controls, as well as the state it’s in, should be made clear from the corresponding inline label. Switch can also be used with a label description thanks to the FormControlLabel component.",
      value: "switches",
    },
  ];

  return (
    <div style={{ width: "500px" }}>
      <CheckboxGroup defaultCheckedValues={["radio"]}>
        {checkboxesData.map((data) => (
          <Checkbox key={data.value} {...data} />
        ))}
      </CheckboxGroup>
    </div>
  );
};

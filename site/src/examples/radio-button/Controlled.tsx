import { ChangeEventHandler, ReactElement, useState } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";

const radioData = [
  {
    label: "NAMR",
    value: "option1",
  },
  {
    label: "APAC",
    value: "option2",
  },
  {
    disabled: true,
    label: "EMEA",
    value: "option3",
  },
];

export const Controlled = (): ReactElement => {
  const [controlledValue, setControlledValue] = useState("option2");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setControlledValue(value);
    // onChange?.(event);
  };

  return (
    <RadioButtonGroup
      aria-label="Controlled Example"
      name="region"
      onChange={handleChange}
      value={controlledValue}
    >
      {radioData.map((radio) => (
        <RadioButton
          key={radio.label}
          label={radio.label}
          value={radio.value}
          disabled={radio.disabled}
        />
      ))}
    </RadioButtonGroup>
  );
};

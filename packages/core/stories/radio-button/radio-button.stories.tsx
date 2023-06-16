import { ChangeEventHandler, useState } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Core/Radio Button",
  component: RadioButton,
} as ComponentMeta<typeof RadioButton>;

export const Default = () => {
  return <RadioButton label="Default" value="Unchecked" />;
};

export const Checked = () => {
  return <RadioButton label="Checked" value="Checked" checked />;
};

export const Disabled = () => {
  return (
    <>
      <RadioButton disabled label="Disabled" value="Disabled" />
      <RadioButton
        disabled
        label="Checked Disabled"
        value="Disabled-checked"
        checked
      />
    </>
  );
};

export const Error = () => {
  return (
    <>
      <RadioButton label="Error" value="Error-unchecked" validationStatus="error" />
      <RadioButton label="Error" value="Error-checked" checked validationStatus="error" />
    </>
  );
};

export const Warning = () => {
  return (
    <>
      <RadioButton label="Error" value="Error-unchecked" validationStatus="warning" />
      <RadioButton label="Error" value="Error-checked" checked validationStatus="warning" />
    </>
  );
};

export const VerticalGroup = () => (
  <RadioButtonGroup>
    <RadioButton key="option1" label="Radio Option 1" value="option1" />
    <RadioButton key="option2" label="Radio Option 2" value="option2" />
    <RadioButton key="option3" label="Radio Option 3" value="option3" />
  </RadioButtonGroup>
);

export const HorizontalGroup = () => (
  <RadioButtonGroup direction={"horizontal"}>
    <RadioButton key="option1" label="Radio Option 1" value="option1" />
    <RadioButton key="option2" label="Radio Option 2" value="option2" />
    <RadioButton key="option3" label="Radio Option 3" value="option3" />
  </RadioButtonGroup>
);

export const WrapGroup: ComponentStory<typeof RadioButtonGroup> = ({
  wrap,
}) => (
  <div
    style={{
      width: 250,
    }}
  >
    <RadioButtonGroup name="fx" direction={"horizontal"} wrap={wrap}>
      <RadioButton key="option1" label="Radio Option 1" value="option1" />
      <RadioButton key="option2" label="Radio Option 2" value="option2" />
      <RadioButton
        disabled
        key="option3"
        label="Radio Option 3 (disabled)"
        value="option3"
      />
    </RadioButtonGroup>
  </div>
);

WrapGroup.args = { wrap: true };

export const NoWrapGroup = WrapGroup.bind({});
NoWrapGroup.args = { wrap: false };

/* Controlled Radio Button Group */

const radioData = [
  {
    label: "Controlled Radio Option 1",
    value: "option1",
  },
  {
    label: "Controlled Radio Option 2",
    value: "option2",
  },
  {
    disabled: true,
    label: "Controlled Radio Option 3 (disabled)",
    value: "option3",
  },
];

export const ControlledGroup: ComponentStory<typeof RadioButtonGroup> = ({
  onChange,
}) => {
  const [controlledValue, setControlledValue] = useState("option2");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setControlledValue(value);
    onChange?.(event);
  };

  return (
    <RadioButtonGroup
      aria-label="Controlled Example"
      name="fx"
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

/* Long Text Radio Button Group */

export const LongTextGroup: ComponentStory<typeof RadioButtonGroup> = () => (
  <div style={{ width: 500 }}>
    <RadioButtonGroup aria-label="Long Text Example" name="selectionControls">
      <RadioButton
        label="Checkboxes allow the user to select multiple options from a set. If you have multiple options appearing in a list, you can preserve space by using checkboxes instead of on/off switches. If you have a single option, avoid using a checkbox and use an on/off switch instead."
        value="checkboxes"
      />
      <RadioButton
        label="Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side."
        value="radio"
      />
      <RadioButton
        label="On/off switches toggle the state of a single settings option. The option that the switch controls, as well as the state it’s in, should be made clear from the corresponding inline label. Switch can also be used with a label description thanks to the FormControlLabel component."
        value="switches"
        disabled
      />
    </RadioButtonGroup>
  </div>
);

import { ChangeEventHandler, useState } from "react";
import { RadioButton, RadioButtonGroup } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Radio Button",
  component: RadioButton,
} as Meta<typeof RadioButton>;

export const Default = () => {
  return <RadioButton label="Subscribe" value="Unchecked" />;
};

export const Checked = () => {
  return <RadioButton label="Subscribe" value="subscribe" checked />;
};

export const Disabled = () => {
  return (
    <RadioButtonGroup disabled>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};

export const Readonly = () => {
  return (
    <RadioButtonGroup readOnly>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};

export const Error = () => {
  return (
    <RadioButtonGroup validationStatus="error">
      <RadioButton label="Error" value="Error-unchecked" />
      <RadioButton label="Error" value="Error-checked" checked />
    </RadioButtonGroup>
  );
};

export const Warning = () => {
  return (
    <RadioButtonGroup validationStatus="warning">
      <RadioButton label="Warning" value="Warning-unchecked" />
      <RadioButton label="Warning" value="Warning-checked" checked />
    </RadioButtonGroup>
  );
};

export const VerticalGroup = () => (
  <RadioButtonGroup>
    <RadioButton key="option1" label="NAMR" value="option1" />
    <RadioButton key="option2" label="APAC" value="option2" />
    <RadioButton key="option3" label="EMEA" value="option3" />
  </RadioButtonGroup>
);

export const HorizontalGroup = () => (
  <RadioButtonGroup direction={"horizontal"}>
    <RadioButton key="option1" label="NAMR" value="option1" />
    <RadioButton key="option2" label="APAC" value="option2" />
    <RadioButton key="option3" label="EMEA" value="option3" />
  </RadioButtonGroup>
);

export const WrapGroup: StoryFn<typeof RadioButtonGroup> = ({ wrap }) => (
  <div
    style={{
      width: 250,
    }}
  >
    <RadioButtonGroup name="fx" direction={"horizontal"} wrap={wrap}>
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

WrapGroup.args = { wrap: true };

export const NoWrapGroup = WrapGroup.bind({});
NoWrapGroup.args = { wrap: false };

/* Controlled Radio Button Group */

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

export const ControlledGroup: StoryFn<typeof RadioButtonGroup> = ({
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

/* Long Text Radio Button Group */

export const LongTextGroup: StoryFn<typeof RadioButtonGroup> = () => (
  <div style={{ width: 500 }}>
    <RadioButtonGroup aria-label="Long Text Example" name="selectionControls">
      <RadioButton
        label="Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side."
        value="radio"
      />
      <RadioButton
        label="Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side."
        value="radio"
      />
      <RadioButton
        label="Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side."
        value="radio"
      />
    </RadioButtonGroup>
  </div>
);

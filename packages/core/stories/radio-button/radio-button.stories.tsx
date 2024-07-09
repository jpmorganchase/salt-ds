import {
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { type ChangeEventHandler, useState } from "react";

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

export const WithDescription = () => {
  return (
    <RadioButton
      value="bonds"
      label={
        <StackLayout gap={0.5} align="start">
          <Text>Bonds</Text>
          <Text color="secondary">Debt securities</Text>
        </StackLayout>
      }
    />
  );
};

export const Disabled = () => {
  return (
    <RadioButtonGroup name="region" disabled>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};

export const Readonly = () => {
  return (
    <RadioButtonGroup name="region" readOnly>
      <RadioButton label="Validate with email" value="email" />
      <RadioButton label="Validate with text message" value="text" checked />
    </RadioButtonGroup>
  );
};

export const Error = () => {
  return (
    <RadioButtonGroup name="region" validationStatus="error">
      <RadioButton label="Error" value="Error-unchecked" />
      <RadioButton label="Error" value="Error-checked" checked />
    </RadioButtonGroup>
  );
};

export const Warning = () => {
  return (
    <RadioButtonGroup name="region" validationStatus="warning">
      <RadioButton label="Warning" value="Warning-unchecked" />
      <RadioButton label="Warning" value="Warning-checked" checked />
    </RadioButtonGroup>
  );
};

export const VerticalGroup = () => (
  <RadioButtonGroup name="region">
    <RadioButton label="NAMR" value="namr" />
    <RadioButton label="APAC" value="apac" />
    <RadioButton label="EMEA" value="emea" />
  </RadioButtonGroup>
);

export const HorizontalGroup = () => (
  <RadioButtonGroup name="region" direction="horizontal">
    <RadioButton label="NAMR" value="namr" />
    <RadioButton label="APAC" value="apac" />
    <RadioButton label="EMEA" value="emea" />
  </RadioButtonGroup>
);

const GroupWithDescriptions: StoryFn<typeof RadioButtonGroup> = (args) => (
  <RadioButtonGroup name="region" {...args}>
    <RadioButton
      value="namr"
      label={
        <StackLayout gap={0.5} align="start">
          <Text>NAMR</Text>
          <Text color="secondary">North America</Text>
        </StackLayout>
      }
    />
    <RadioButton
      value="apac"
      label={
        <StackLayout gap={0.5} align="start">
          <Text>APAC</Text>
          <Text color="secondary">Asia–Pacific</Text>
        </StackLayout>
      }
    />
    <RadioButton
      value="emea"
      label={
        <StackLayout gap={0.5} align="start">
          <Text>EMEA</Text>
          <Text color="secondary">Europe, Middle East, and Africa</Text>
        </StackLayout>
      }
    />
  </RadioButtonGroup>
);

export const VerticalGroupWithDescriptions = GroupWithDescriptions.bind({});
VerticalGroupWithDescriptions.args = { direction: "vertical" };
export const HorizontalGroupWithDescriptions = GroupWithDescriptions.bind({});
HorizontalGroupWithDescriptions.args = { direction: "horizontal" };

export const WrapGroup: StoryFn<typeof RadioButtonGroup> = ({ wrap }) => (
  <div
    style={{
      width: 250,
    }}
  >
    <RadioButtonGroup name="region" direction="horizontal" wrap={wrap}>
      <RadioButton label="North America" value="namr" />
      <RadioButton label="Asia, Pacific" value="apac" />
      <RadioButton disabled label="Europe, Middle East, Africa" value="emea" />
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
    value: "namr",
  },
  {
    label: "APAC",
    value: "apac",
  },
  {
    disabled: true,
    label: "EMEA",
    value: "emea",
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

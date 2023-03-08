import { ChangeEventHandler, useState } from "react";
import { SaltProvider, Panel, FlexLayout } from "@salt-ds/core";
import {
  RadioButton,
  RadioButtonGroup,
  RadioButtonGroupProps,
} from "@salt-ds/lab";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

export default {
  title: "Lab/Radio Button",
  component: RadioButton,
} as ComponentMeta<typeof RadioButton>;

export const RadioButtonVariations = () => {
  return (
    <>
      <RadioButton label="Unchecked" value="Unchecked" />
      <RadioButton label="Checked" value="Checked" checked />
      <RadioButton disabled label="Disabled" value="Disabled" />
      <RadioButton
        disabled
        label="Disabled checked"
        value="Disabled-checked"
        checked
      />

      <RadioButton label="Error unchecked" value="Error-unchecked" error />
      <RadioButton label="Error checked" value="Error-checked" checked error />
      <RadioButton
        label="Disabled error"
        value="disabled-error"
        disabled
        error
      />
      <RadioButton
        label="Disabled error checked"
        value="disabled-error-checked"
        checked
        disabled
        error
      />
    </>
  );
};

export const VerticalRadioButtonGroup = () => (
  <SaltProvider>
    <RadioButtonGroup>
      <RadioButton key="option1" label="Radio Option 1" value="option1" />
      <RadioButton key="option2" label="Radio Option 2" value="option2" />
      <RadioButton
        disabled
        key="option3"
        label="Radio Option 3 (disabled)"
        value="option3"
      />
    </RadioButtonGroup>
  </SaltProvider>
);

export const HorizontalRadioButtonGroup = ({
  labelWrap,
}: RadioButtonGroupProps) => (
  <SaltProvider>
    <RadioButtonGroup direction={"horizontal"} labelWrap={labelWrap}>
      <RadioButton key="option1" label="Radio Option 1" value="option1" />
      <RadioButton key="option2" label="Radio Option 2" value="option2" />
      <RadioButton
        disabled
        key="option3"
        label="Radio Option 3 (disabled)"
        value="option3"
      />
    </RadioButtonGroup>
  </SaltProvider>
);

interface DensityExampleProps {
  density?: "high" | "medium" | "low" | "touch";
  direction: "vertical" | "horizontal";
  name: string;
  title: string;
}
interface DensityExamplesProps {
  name: string;
}

const DensityExample = ({ density, direction, name }: DensityExampleProps) => (
  <SaltProvider density={density}>
    <RadioButtonGroup name={`${name}-${density}`} direction={direction}>
      <RadioButtonVariations />
    </RadioButtonGroup>
  </SaltProvider>
);

const DensityExamples = ({ name }: DensityExamplesProps) => (
  <Panel style={{ height: "unset" }}>
    <FlexLayout gap={4} direction="column">
      <FlexLayout gap={4} wrap>
        <DensityExample
          density="high"
          name={name}
          title="High"
          direction="vertical"
        />
        <DensityExample
          density="medium"
          name={name}
          title="Medium"
          direction="vertical"
        />
        <DensityExample
          density="low"
          name={name}
          title="Low"
          direction="vertical"
        />
        <DensityExample
          density="touch"
          name={name}
          title="Touch"
          direction="vertical"
        />
      </FlexLayout>
      <FlexLayout gap={4} wrap>
        <DensityExample
          density="high"
          name={name}
          title="High"
          direction="horizontal"
        />
        <DensityExample
          density="medium"
          name={name}
          title="Medium"
          direction="horizontal"
        />
        <DensityExample
          density="low"
          name={name}
          title="Low"
          direction="horizontal"
        />
        <DensityExample
          density="touch"
          name={name}
          title="Touch"
          direction="horizontal"
        />
      </FlexLayout>
    </FlexLayout>
  </Panel>
);

export const All: Story = () => (
  <>
    <SaltProvider mode="light">
      <DensityExamples name="light" />
    </SaltProvider>
    <SaltProvider mode="dark">
      <DensityExamples name="dark" />
    </SaltProvider>
  </>
);

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

export const ControlledRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = ({ onChange }) => {
  const [controlledValue, setControlledValue] = useState("option2");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setControlledValue(value);
    onChange && onChange(event);
  };

  return (
    <RadioButtonGroup
      aria-label="Controlled Example"
      name="fx"
      onChange={handleChange}
      value={controlledValue}
    >
      {radioData.map((radio) => (
        <RadioButton {...radio} />
      ))}
    </RadioButtonGroup>
  );
};

/* Long Text Radio Button Group */

export const LongTextRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = () => (
  <div style={{ width: 500 }}>
    <RadioButtonGroup aria-label="Long Text Example" name="selectionControls">
      <RadioButton
        key="checkboxes"
        label="Checkboxes allow the user to select multiple options from a set. If you have multiple options appearing in a list, you can preserve space by using checkboxes instead of on/off switches. If you have a single option, avoid using a checkbox and use an on/off switch instead."
        value="checkboxes"
      />
      <RadioButton
        key="radio"
        label="Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side. Radio buttons allow the user to select one option from a set. Use radio buttons for exclusive selection if you think that the user needs to see all available options side-by-side."
        value="radio"
      />
      <RadioButton
        key="switches"
        label="On/off switches toggle the state of a single settings option. The option that the switch controls, as well as the state it’s in, should be made clear from the corresponding inline label. Switch can also be used with a label description thanks to the FormControlLabel component."
        value="switches"
        disabled
      />
    </RadioButtonGroup>
  </div>
);

export const LabelWrapRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = ({ labelWrap }) => (
  <div
    style={{
      width: 250,
    }}
  >
    <RadioButtonGroup name="fx" direction={"horizontal"} labelWrap={labelWrap}>
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

LabelWrapRadioButtonGroup.args = { labelWrap: true };

import { ChangeEventHandler, useState } from "react";
import { Density, SaltProvider, Panel, FlexLayout } from "@salt-ds/core";
import { RadioButton, RadioButtonGroup } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

export default {
  title: "Lab/Radio Button",
  component: RadioButton,
} as ComponentMeta<typeof RadioButton>;

type ExampleWithTitleProps = {
  title: string;
  density: Density;
  name: string;
};

export const RadioButtonVariations = () => {
  return (
    <>
      <RadioButton key="Unchecked" label="Unchecked" value="Unchecked" />
      <RadioButton key="Checked" label="Checked" value="Checked" checked />
      <RadioButton disabled key="Disabled" label="Disabled" value="Disabled" />
      <RadioButton
        disabled
        key="Disabled-checked"
        label="Disabled checked"
        value="Disabled-checked"
        checked
      />

      <RadioButton
        key="Error-unchecked"
        label="Error unchecked"
        value="Error-unchecked"
        error
      />
      <RadioButton
        key="Error-checked"
        label="Error checked"
        value="Error-checked"
        checked
        error
      />
    </>
  );
};

export const VerticalRadioButtonGroup = ({
  title,
  density,
  name,
}: ExampleWithTitleProps) => (
  <SaltProvider density={density}>
    <RadioButtonGroup legend={title} name={name}>
      <RadioButton key="spot" label="Spot" value="spot" />
      <RadioButton key="forward" label="Forward" value="forward" />
      <RadioButton
        disabled
        key="option"
        label="Option (disabled)"
        value="option"
      />
    </RadioButtonGroup>
  </SaltProvider>
);

export const HorizontalRadioButtonGroup = ({
  title,
  density,
  name,
}: ExampleWithTitleProps) => (
  <SaltProvider density={density}>
    <RadioButtonGroup legend={title} name={name} direction={"horizontal"}>
      <RadioButton key="spot" label="Spot" value="spot" />
      <RadioButton key="forward" label="Forward" value="forward" />
      <RadioButton
        disabled
        key="option"
        label="Option (disabled)"
        value="option"
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

const DensityExample = ({
  density,
  direction,
  name,
  title,
}: DensityExampleProps) => (
  <SaltProvider density={density}>
    <RadioButtonGroup
      name={`${name}-${density}`}
      legend={title}
      direction={direction}
    >
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
    label: "Spot",
    value: "spot",
  },
  {
    label: "Forward",
    value: "forward",
  },
  {
    disabled: true,
    label: "Option (disabled)",
    value: "option",
  },
];

export const ControlledRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = ({ onChange }) => {
  const [controlledValue, setControlledValue] = useState("forward");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    setControlledValue(value);
    onChange && onChange(event);
  };

  return (
    <RadioButtonGroup
      aria-label="Controlled Example"
      legend="Controlled Group"
      name="fx"
      onChange={handleChange}
      radios={radioData}
      value={controlledValue}
      direction={"horizontal"}
    />
  );
};

/* Long Text Radio Button Group */

export const LongTextRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = () => (
  <div style={{ width: "500px" }}>
    <RadioButtonGroup
      aria-label="Long Text Example"
      legend="Long Text Group"
      name="selectionControls"
    >
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
      />
    </RadioButtonGroup>
  </div>
);

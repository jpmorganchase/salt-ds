import { ChangeEventHandler, ReactNode, useState } from "react";
import { Density, Mode, SaltProvider, Panel, FlexLayout } from "@salt-ds/core";
import {
  FormField,
  makeRadioIcon,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/lab";
import { SuccessTickIcon } from "@salt-ds/icons";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { ColumnLayoutContainer, ColumnLayoutItem } from "docs/story-layout";

export default {
  title: "Lab/Radio Button",
  component: RadioButton,
} as ComponentMeta<typeof RadioButton>;

type ExampleWithTitleProps = {
  title: string;
  density: Density;
  name: string;
};

export const Default = () => <RadioButton label="Default" />;

export const ColumnGroup = ({
  title,
  density,
  name,
}: ExampleWithTitleProps) => (
  <Panel>
    <SaltProvider density={density}>
      <RadioButtonGroup
        // defaultValue="forward"
        legend={title}
        name={name}
      >
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
  </Panel>
);

export const RowGroup = ({ title, density, name }: ExampleWithTitleProps) => (
  <SaltProvider density={density}>
    <RadioButtonGroup legend={title} name={name} direction="row">
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
  name: string;
}

const DensityExample = ({ name }: DensityExampleProps) => (
  <Panel style={{ height: "unset" }}>
    <FlexLayout gap={4}>
      <ColumnGroup name={`${name}-high`} title="High" density="high" />
      <ColumnGroup name={`${name}-medium`} title="Medium" density="medium" />
      <ColumnGroup name={`${name}-low`} title="Low" density="low" />
      <ColumnGroup name={`${name}-touch`} title="Touch" density="touch" />
    </FlexLayout>
    <FlexLayout gap={4}>
      <RowGroup name={`${name}-row-high`} title="high" density="high" />
      <RowGroup name={`${name}-row-medium`} title="medium" density="medium" />
      <RowGroup name={`${name}-row-low`} title="low" density="low" />
      <RowGroup name={`${name}-row-touch`} title="touch" density="touch" />
    </FlexLayout>
  </Panel>
);

export const All: Story = () => (
  <div>
    <SaltProvider mode="light">
      <DensityExample name="light" />
    </SaltProvider>
    <SaltProvider mode="dark">
      <DensityExample name="dark" />
    </SaltProvider>
  </div>
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
    />
  );
};

/* Long Text Radio Button Group */

export const LongTextRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = ({ onChange }) => (
  <div style={{ width: "500px" }}>
    <RadioButtonGroup
      aria-label="Long Text Example"
      defaultValue="switches"
      legend="Long Text Group"
      name="selectionControls"
      onChange={onChange}
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
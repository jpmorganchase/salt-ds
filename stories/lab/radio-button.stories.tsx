import { Density, ToolkitProvider } from "@brandname/core";
import { SuccessTickIcon } from "@brandname/icons";
import {
  FormField,
  FormFieldVariantType,
  makeRadioIcon,
  Panel,
  RadioButton,
  RadioButtonGroup,
} from "@brandname/lab";
import {
  ColumnLayoutContainer,
  ColumnLayoutItem,
} from "./story-layout/ColumnLayout";
import { ChangeEventHandler, FC, ReactNode, useState } from "react";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

export default {
  title: "Lab/Radio Button",
  component: RadioButton,
} as ComponentMeta<typeof RadioButton>;

type ExampleWithTitle = FC<{
  title: string;
  density: Density;
  name: string;
}>;

const Radios: ExampleWithTitle = ({ title, density, name }) => (
  <ColumnLayoutItem>
    <ToolkitProvider density={density}>
      <div data-testid="radio-button-next-density-example">
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
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
      </div>
    </ToolkitProvider>
  </ColumnLayoutItem>
);

const RowGroup: ExampleWithTitle = ({ title, density, name }) => (
  <Panel>
    <ToolkitProvider density={density}>
      <RadioButtonGroup legend={title} name={name} row>
        <RadioButton key="spot" label="Spot" value="spot" />
        <RadioButton key="forward" label="Forward" value="forward" />
      </RadioButtonGroup>
    </ToolkitProvider>
  </Panel>
);

interface DensityExampleProps {
  name: string;
}

const DensityExample: FC<DensityExampleProps> = ({ name }) => (
  <Panel style={{ height: "unset" }}>
    <ColumnLayoutContainer>
      <Radios name={`${name}-high`} title="High" density="high" />
      <Radios name={`${name}-medium`} title="Medium" density="medium" />
      <Radios name={`${name}-low`} title="Low" density="low" />
      <Radios name={`${name}-touch`} title="Touch" density="touch" />
    </ColumnLayoutContainer>
    <ColumnLayoutContainer>
      <RowGroup name={`${name}-row-high`} title="high" density="high" />
      <RowGroup name={`${name}-row-medium`} title="medium" density="medium" />
      <RowGroup name={`${name}-row-low`} title="low" density="low" />
      <RowGroup name={`${name}-row-touch`} title="touch" density="touch" />
    </ColumnLayoutContainer>
  </Panel>
);

const StoryScroller: FC = (props) => (
  <div
    style={{
      height: "100%",
      overflowY: "scroll",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    }}
  >
    {props.children}
  </div>
);

export const All: Story = () => (
  <StoryScroller>
    <ToolkitProvider theme="light">
      <DensityExample name="light" />
    </ToolkitProvider>
    <ToolkitProvider theme="dark">
      <DensityExample name="dark" />
    </ToolkitProvider>
  </StoryScroller>
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
    <div style={{ width: "200px" }}>
      <RadioButtonGroup
        aria-label="Controlled Example"
        legend="Controlled Group"
        name="fx"
        onChange={handleChange}
        radios={radioData}
        value={controlledValue}
      />
    </div>
  );
};

/* Custom Icons */
const checkedIcon = <SuccessTickIcon />;
const uncheckedIcon = (
  <div style={{ height: "14px", width: "14px", border: "solid 1px black" }} />
);
const CustomIcon = makeRadioIcon(checkedIcon, uncheckedIcon);

export const CustomIcons: ComponentStory<typeof RadioButtonGroup> = () => (
  <div>
    <RadioButtonGroup
      aria-label="Custom Icons"
      defaultValue="forward"
      legend="Custom Icons"
      name="fx"
    >
      <RadioButton key="spot" label="Spot" value="spot" icon={CustomIcon} />
      <RadioButton
        key="forward"
        label="Forward"
        value="forward"
        icon={CustomIcon}
      />
      <RadioButton
        disabled
        key="option"
        label="Option (disabled)"
        value="option"
        icon={CustomIcon}
      />
    </RadioButtonGroup>
  </div>
);

/* FormField variants */

type ExampleWithTitleAndVariant = FC<{
  name: string;
  title: string;
  variant: FormFieldVariantType;
}>;

const FormFieldRadios: ExampleWithTitleAndVariant = ({
  name,
  title,
  variant,
}) => (
  <div data-testid="radio-button-form-field-variants-example">
    <FormField variant={variant}>
      <RadioButtonGroup
        aria-label="Variants Example"
        defaultValue="forward"
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
    </FormField>
  </div>
);

const VariantExample = ({ name, theme }: { name: string; theme: string }) => (
  <ToolkitProvider theme={theme}>
    <Panel style={{ height: "unset" }}>
      <ColumnLayoutContainer>
        <ColumnLayoutItem>
          <FormFieldRadios
            name={`${name}-1`}
            title="Theme Variant"
            variant="theme"
          />
        </ColumnLayoutItem>
        <ColumnLayoutItem>
          <FormFieldRadios name="fx2" title="Filled Variant" variant="filled" />
        </ColumnLayoutItem>
        <ColumnLayoutItem>
          <FormFieldRadios
            name={`${name}-2`}
            title="Transparent Variant"
            variant="transparent"
          />
        </ColumnLayoutItem>
      </ColumnLayoutContainer>
    </Panel>
  </ToolkitProvider>
);

export const FormFieldVariants: Story = () => (
  <StoryScroller>
    <VariantExample name="fx1" theme="light" />
    <VariantExample name="fx2" theme="dark" />
  </StoryScroller>
);

/* Group Form Field Row */

interface ExampleRowProps {
  children: ReactNode;
  name: string;
}

const ExampleRow: FC<ExampleRowProps> = ({ children, name }) => {
  const densities: Density[] = ["touch", "low", "medium", "high"];
  const row = densities.map((density) => {
    const exampleKey = `${density}-${name}`.toLowerCase();
    return (
      <ColumnLayoutItem key={exampleKey}>
        <ToolkitProvider density={density}>{children}</ToolkitProvider>
      </ColumnLayoutItem>
    );
  });
  return (
    <Panel style={{ height: "unset", marginLeft: 20, width: "100%" }}>
      <h3>{name}</h3>
      <ColumnLayoutContainer>{row}</ColumnLayoutContainer>
    </Panel>
  );
};

const GroupFormFieldExamples = ({ theme }: { theme: string }) => (
  <ToolkitProvider theme={theme}>
    <>
      <ExampleRow name="Basic">
        <FormField
          helperText="This is some help text"
          label="ADA compliant label"
          labelPlacement="left"
        >
          <RadioButtonGroup
            aria-label="Uncontrolled Example"
            defaultValue="forward"
            legend="Uncontrolled Group"
            name="fx"
            row
          >
            <RadioButton key="spot" label="Spot" value="spot" />
            <RadioButton key="forward" label="Forward" value="forward" />
            <RadioButton key="option" label="Option" value="option" />
          </RadioButtonGroup>
        </FormField>
      </ExampleRow>
      <ExampleRow name="Warning">
        <FormField
          helperText="This is some help text"
          label="ADA compliant label"
          validationState="warning"
        >
          <RadioButtonGroup
            aria-label="Uncontrolled Example"
            defaultValue="forward"
            legend="Uncontrolled Group"
            name="fx"
            row
          >
            <RadioButton key="spot" label="Spot" value="spot" />
            <RadioButton key="forward" label="Forward" value="forward" />
            <RadioButton key="option" label="Option" value="option" />
          </RadioButtonGroup>
        </FormField>
      </ExampleRow>
      <ExampleRow name="Error">
        <FormField
          helperText="This is some help text"
          label="ADA compliant label"
          validationState="error"
        >
          <RadioButtonGroup
            aria-label="Uncontrolled Example"
            defaultValue="forward"
            legend="Uncontrolled Group"
            name="fx"
            row
          >
            <RadioButton key="spot" label="Spot" value="spot" />
            <RadioButton key="forward" label="Forward" value="forward" />
            <RadioButton key="option" label="Option" value="option" />
          </RadioButtonGroup>
        </FormField>
      </ExampleRow>
      <ExampleRow name="Disabled">
        <FormField
          disabled
          helperText="This is some help text"
          label="ADA compliant label"
        >
          <RadioButtonGroup
            aria-label="Uncontrolled Example"
            defaultValue="forward"
            legend="Uncontrolled Group"
            name="fx"
            row
          >
            <RadioButton key="spot" label="Spot" value="spot" />
            <RadioButton key="forward" label="Forward" value="forward" />
            <RadioButton key="option" label="Option" value="option" />
          </RadioButtonGroup>
        </FormField>
      </ExampleRow>
      <ExampleRow name="Required">
        <FormField
          helperText="This is some help text"
          label="ADA compliant label"
          required
        >
          <RadioButtonGroup
            defaultValue="forward"
            legend="Uncontrolled Group"
            name="fx"
            row
          >
            <RadioButton key="spot" label="Spot" value="spot" />
            <RadioButton key="forward" label="Forward" value="forward" />
            <RadioButton key="option" label="Option" value="option" />
          </RadioButtonGroup>
        </FormField>
      </ExampleRow>
    </>
  </ToolkitProvider>
);

export const GroupFormFieldRow: Story = () => (
  <StoryScroller>
    <GroupFormFieldExamples theme="light" />
    <GroupFormFieldExamples theme="dark" />
  </StoryScroller>
);

/* Group Form Field Vertical */

interface GroupFormFieldExampleRowProps {
  children: ReactNode;
  name: string;
}

const GroupFormFieldVerticalExampleRow: FC<GroupFormFieldExampleRowProps> = ({
  children,
  name,
}) => {
  const densities: Density[] = ["touch", "low", "medium", "high"];
  const row = densities.map((density) => {
    const exampleKey = `${density}-${name}`.toLowerCase();
    return (
      <ColumnLayoutItem key={exampleKey}>
        <ToolkitProvider density={density}>{children}</ToolkitProvider>
      </ColumnLayoutItem>
    );
  });
  return (
    <Panel style={{ height: "unset", marginLeft: 20, width: "100%" }}>
      <h3>{name}</h3>
      <ColumnLayoutContainer>{row}</ColumnLayoutContainer>
    </Panel>
  );
};

const GroupFormFieldVerticalExamples = () => (
  <>
    <GroupFormFieldVerticalExampleRow name="Basic">
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
      >
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
          legend="Uncontrolled Group"
          name="fx"
        >
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton key="option" label="Option" value="option" />
        </RadioButtonGroup>
      </FormField>
    </GroupFormFieldVerticalExampleRow>
    <GroupFormFieldVerticalExampleRow name="Warning">
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
        validationState="warning"
      >
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
          legend="Uncontrolled Group"
          name="fx"
        >
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton key="option" label="Option" value="option" />
        </RadioButtonGroup>
      </FormField>
    </GroupFormFieldVerticalExampleRow>
    <GroupFormFieldVerticalExampleRow name="Error">
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
        validationState="error"
      >
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
          legend="Uncontrolled Group"
          name="fx"
        >
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton key="option" label="Option" value="option" />
        </RadioButtonGroup>
      </FormField>
    </GroupFormFieldVerticalExampleRow>
    <GroupFormFieldVerticalExampleRow name="Disabled">
      <FormField
        disabled
        helperText="This is some help text"
        label="ADA compliant label"
      >
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
          legend="Uncontrolled Group"
          name="fx"
        >
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton key="option" label="Option" value="option" />
        </RadioButtonGroup>
      </FormField>
    </GroupFormFieldVerticalExampleRow>
    <GroupFormFieldVerticalExampleRow name="Required">
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
        required
      >
        <RadioButtonGroup
          defaultValue="forward"
          legend="Uncontrolled Group"
          name="fx"
        >
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton key="option" label="Option" value="option" />
        </RadioButtonGroup>
      </FormField>
    </GroupFormFieldVerticalExampleRow>
  </>
);

export const GroupFormFieldVertical: Story = () => (
  <StoryScroller>
    <ToolkitProvider theme="light">
      <GroupFormFieldVerticalExamples />
    </ToolkitProvider>
    <ToolkitProvider theme="dark">
      <GroupFormFieldVerticalExamples />
    </ToolkitProvider>
  </StoryScroller>
);

/* Horizontal Radio Button Group */

export const HorizontalRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = ({ onChange }) => (
  <div>
    <RadioButtonGroup
      aria-label="Uncontrolled Example"
      defaultValue="forward"
      legend="Uncontrolled Group"
      name="fx"
      onChange={onChange}
      row
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
  </div>
);

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

/* Uncontrolled Radio Button Group */

export const UncontrolledRadioButtonGroup: ComponentStory<
  typeof RadioButtonGroup
> = ({ onChange }) => (
  <div style={{ width: "200px" }}>
    <RadioButtonGroup
      aria-label="Uncontrolled Example"
      defaultValue="forward"
      legend="Uncontrolled Group"
      name="fx"
      onChange={onChange}
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
  </div>
);

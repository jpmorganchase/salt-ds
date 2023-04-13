import { ChangeEvent, useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { Button, Checkbox, CheckboxGroup } from "@salt-ds/core";
import { ColumnLayoutContainer } from "docs/story-layout";

export default {
  title: "Core/Checkbox",
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

const CheckboxTemplate: ComponentStory<typeof Checkbox> = (args) => {
  return <Checkbox {...args} />;
};

export const Default = CheckboxTemplate.bind({});

Default.args = {
  label: "Checkbox",
};

export const WithoutLabel = CheckboxTemplate.bind({});

WithoutLabel.args = { defaultChecked: true, "aria-label": "Select" };

export const Indeterminate: ComponentStory<typeof Checkbox> = () => {
  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  return (
    <Checkbox
      checked={checkboxState.checked}
      indeterminate={checkboxState.indeterminate}
      label="Indeterminate checkbox"
      onChange={handleChange}
    />
  );
};

export const Error: ComponentStory<typeof Checkbox> = () => {
  const [errorState, setErrorState] = useState(true);

  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setErrorState(false);
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  return (
    <ColumnLayoutContainer>
      <CheckboxGroup>
        <Checkbox
          error={errorState}
          onChange={() => setErrorState(false)}
          label="Option 1"
        />
        <Checkbox
          error={errorState}
          onChange={() => setErrorState(false)}
          defaultChecked
          label="Option 2"
        />
        <Checkbox
          error={errorState}
          checked={checkboxState.checked}
          indeterminate={checkboxState.indeterminate}
          onChange={handleChange}
          label="Option 3"
        />
        <Button onClick={() => setErrorState(true)}>Reset</Button>
      </CheckboxGroup>
    </ColumnLayoutContainer>
  );
};

export const Disabled: ComponentStory<typeof Checkbox> = () => {
  return (
    <>
      <CheckboxGroup>
        <Checkbox disabled label="disabled checkbox" />
        <Checkbox
          disabled
          indeterminate
          label="disabled indeterminate checkbox"
        />
        <Checkbox disabled checked label="disabled checked checkbox" />
        <Checkbox error disabled label="disabled checkbox in error state" />
        <Checkbox
          error
          disabled
          indeterminate
          label="disabled indeterminate checkbox in error state"
        />
        <Checkbox
          error
          disabled
          checked
          label="disabled checked checkbox in error state"
        />
      </CheckboxGroup>
    </>
  );
};

export const HorizontalGroup: ComponentStory<typeof Checkbox> = () => {
  return (
    <CheckboxGroup
      defaultCheckedValues={["option-1", "option-2"]}
      direction={"horizontal"}
    >
      <Checkbox label="option 1" value="option-1" />
      <Checkbox label="option 2" value="option-2" />
      <Checkbox label="option 3" value="option-3" />
    </CheckboxGroup>
  );
};

export const WrapGroup: ComponentStory<typeof CheckboxGroup> = ({ wrap }) => (
  <div
    style={{
      width: 250,
    }}
  >
    <CheckboxGroup name="fx" direction={"horizontal"} wrap={wrap}>
      <Checkbox key="option1" label="Checkbox label 1" value="option1" />
      <Checkbox key="option2" label="Checkbox label 2" value="option2" />
      <Checkbox
        disabled
        key="option3"
        label="Checkbox label 3 (disabled)"
        value="option3"
      />
    </CheckboxGroup>
  </div>
);

WrapGroup.args = { wrap: true };

export const NoWrapGroup = WrapGroup.bind({});
NoWrapGroup.args = { wrap: false };

export const UncontrolledGroup: ComponentStory<typeof CheckboxGroup> = (
  args
) => {
  return (
    <CheckboxGroup {...args} defaultCheckedValues={["option-1", "option-2"]}>
      <Checkbox label="option 1" value="option-1" />
      <Checkbox label="option 2" value="option-2" />
      <Checkbox label="option 3" value="option-3" />
    </CheckboxGroup>
  );
};

export const ControlledGroup: ComponentStory<typeof CheckboxGroup> = (args) => {
  const checkboxesData = [
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

  const [controlledValues, setControlledValues] = useState(["forward"]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (controlledValues.indexOf(value) === -1) {
      setControlledValues((prevControlledValues) => [
        ...prevControlledValues,
        value,
      ]);
    } else {
      setControlledValues((prevControlledValues) =>
        prevControlledValues.filter(
          (controlledValue) => controlledValue !== value
        )
      );
    }
  };
  return (
    <CheckboxGroup
      {...args}
      checkedValues={controlledValues}
      onChange={handleChange}
    >
      {checkboxesData.map((data) => (
        <Checkbox key={data.value} {...data} />
      ))}
    </CheckboxGroup>
  );
};

export const LongTextGroup: ComponentStory<typeof CheckboxGroup> = (args) => {
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
      <CheckboxGroup {...args} defaultCheckedValues={["radio"]}>
        {checkboxesData.map((data) => (
          <Checkbox key={data.value} {...data} />
        ))}
      </CheckboxGroup>
    </div>
  );
};

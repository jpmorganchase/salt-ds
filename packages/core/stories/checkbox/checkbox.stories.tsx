import { ChangeEvent, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Button, Checkbox, CheckboxGroup, StackLayout } from "@salt-ds/core";

export default {
  title: "Core/Checkbox",
  component: Checkbox,
} as Meta<typeof Checkbox>;

const CheckboxTemplate: StoryFn<typeof Checkbox> = (args) => {
  return <Checkbox {...args} />;
};

export const Default = CheckboxTemplate.bind({});

Default.args = {
  label: "Fixed income",
};

export const WithoutLabel = CheckboxTemplate.bind({});

WithoutLabel.args = { defaultChecked: true, "aria-label": "Select" };

export const Indeterminate: StoryFn<typeof Checkbox> = () => {
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
      label="Equities"
      onChange={handleChange}
    />
  );
};

export const Error: StoryFn<typeof Checkbox> = () => {
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
    <StackLayout>
      <CheckboxGroup validationStatus={errorState ? "error" : undefined}>
        <Checkbox onChange={() => setErrorState(false)} label="Alternatives" />
        <Checkbox
          onChange={() => setErrorState(false)}
          defaultChecked
          label="Equities"
        />
        <Checkbox
          checked={checkboxState.checked}
          indeterminate={checkboxState.indeterminate}
          onChange={handleChange}
          label="Fixed income"
        />
      </CheckboxGroup>
      <Button onClick={() => setErrorState(true)}>Reset</Button>
    </StackLayout>
  );
};

export const Warning: StoryFn<typeof Checkbox> = () => {
  const [warningState, setWarningState] = useState(true);

  const [checkboxState, setCheckboxState] = useState({
    checked: false,
    indeterminate: true,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updatedChecked = event.target.checked;
    setWarningState(false);
    setCheckboxState({
      indeterminate: !updatedChecked && checkboxState.checked,
      checked:
        checkboxState.indeterminate && updatedChecked ? false : updatedChecked,
    });
  };

  return (
    <StackLayout>
      <CheckboxGroup validationStatus={warningState ? "warning" : undefined}>
        <Checkbox
          onChange={() => setWarningState(false)}
          label="Alternatives"
        />
        <Checkbox
          onChange={() => setWarningState(false)}
          defaultChecked
          label="Equities"
        />
        <Checkbox
          checked={checkboxState.checked}
          indeterminate={checkboxState.indeterminate}
          onChange={handleChange}
          label="Fixed income"
        />
      </CheckboxGroup>
      <Button onClick={() => setWarningState(true)}>Reset</Button>
    </StackLayout>
  );
};

export const Disabled: StoryFn<typeof Checkbox> = () => {
  return (
    <CheckboxGroup>
      <Checkbox disabled label="Alternatives" />
      <Checkbox disabled indeterminate label="Equities" />
      <Checkbox disabled checked label="Fixed income" />
    </CheckboxGroup>
  );
};

export const Readonly: StoryFn<typeof Checkbox> = () => {
  return (
    <CheckboxGroup>
      <Checkbox readOnly label="Alternatives" />
      <Checkbox readOnly indeterminate label="Equities" />
      <Checkbox readOnly checked label="Fixed income" />
    </CheckboxGroup>
  );
};

export const HorizontalGroup: StoryFn<typeof Checkbox> = () => {
  return (
    <CheckboxGroup
      defaultCheckedValues={["option-1", "option-2"]}
      direction={"horizontal"}
    >
      <Checkbox label="Alternatives" value="option-1" />
      <Checkbox label="Equities" value="option-2" />
      <Checkbox label="Fixed income" value="option-3" />
    </CheckboxGroup>
  );
};

export const WrapGroup: StoryFn<typeof CheckboxGroup> = ({ wrap }) => (
  <div
    style={{
      width: 250,
    }}
  >
    <CheckboxGroup name="fx" direction={"horizontal"} wrap={wrap}>
      <Checkbox key="option1" label="Alternatives" value="alternatives" />
      <Checkbox key="option2" label="Equities" value="equities" />
      <Checkbox
        disabled
        key="option3"
        label="Fixed income"
        value="fixed income"
      />
    </CheckboxGroup>
  </div>
);

WrapGroup.args = { wrap: true };

export const NoWrapGroup = WrapGroup.bind({});
NoWrapGroup.args = { wrap: false };

export const UncontrolledGroup: StoryFn<typeof CheckboxGroup> = (args) => {
  return (
    <CheckboxGroup {...args} defaultCheckedValues={["option-1", "option-2"]}>
      <Checkbox label="Alternatives" value="option-1" />
      <Checkbox label="Equities" value="option-2" />
      <Checkbox label="Fixed income" value="option-3" />
    </CheckboxGroup>
  );
};

export const ControlledGroup: StoryFn<typeof CheckboxGroup> = (args) => {
  const checkboxesData = [
    {
      label: "Alternatives",
      value: "alternatives",
    },
    {
      label: "Equities",
      value: "equities",
    },
    {
      disabled: true,
      label: "Fixed income",
      value: "Fixed income",
    },
  ];

  const [controlledValues, setControlledValues] = useState(["equities"]);

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

export const LongTextGroup: StoryFn<typeof CheckboxGroup> = (args) => {
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

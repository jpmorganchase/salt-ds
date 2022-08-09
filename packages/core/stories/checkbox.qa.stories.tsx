import { ComponentMeta, Story } from "@storybook/react";
import { Checkbox, CheckboxGroup, FormField } from "@jpmorganchase/uitk-core";
import { QAContainer, QAContainerProps } from "docs/components";
import "./checkbox.qa.stories.css";

export default {
  title: "Core/Checkbox/QA",
  component: Checkbox,
} as ComponentMeta<typeof Checkbox>;

export const CheckboxAllStatesGrid: Story<
  QAContainerProps & { className?: string }
> = ({ className, ...props }) => {
  return (
    <QAContainer cols={1} height={500} width={1200} {...props}>
      <Checkbox
        className={className}
        label="I understand ADA requires Labels on unchecked checkboxes"
      />
      <Checkbox
        className={className}
        defaultChecked
        label="I understand ADA requires Labels on checked checkboxes"
      />
      <Checkbox
        className={className}
        defaultChecked
        indeterminate
        label="I understand ADA requires Labels on indeterminate checkboxes"
      />
      <Checkbox
        className={className}
        disabled
        label="I understand ADA requires Labels on indeterminate checkboxes"
      />
    </QAContainer>
  );
};

CheckboxAllStatesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = CheckboxAllStatesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <CheckboxAllStatesGrid imgSrc="/visual-regression-screenshots/Checkbox-vr-snapshot.png" />
  );
};

export const CheckboxGroupGrid: Story<
  QAContainerProps & { className?: string }
> = ({ className, ...props }) => {
  return (
    <QAContainer cols={1} height={760} width={1200} {...props}>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
        labelPlacement="top"
      >
        <CheckboxGroup
          defaultCheckedValues={["option-1", "option-2"]}
          row
          className={className}
        >
          <Checkbox label="option 1" value="option-1" />
          <Checkbox label="option 2" value="option-2" />
          <Checkbox label="option 3" value="option-3" />
        </CheckboxGroup>
      </FormField>
      <FormField
        helperText="This is some help text"
        label="ADA compliant label"
        labelPlacement="top"
      >
        <CheckboxGroup
          defaultCheckedValues={["option-1", "option-2"]}
          className={className}
        >
          <Checkbox label="option 1" value="option-1" />
          <Checkbox label="option 2" value="option-2" />
          <Checkbox label="option 3" value="option-3" />
        </CheckboxGroup>
      </FormField>
    </QAContainer>
  );
};

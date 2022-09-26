import cx from "classnames";
import {
  FormField,
  Input,
  Checkbox,
  CheckboxGroup,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Switch,
  FlexLayout,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Form Field/QA",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  const { imgSrc, className } = props;
  return (
    <QAContainer imgSrc={imgSrc}>
      <FormField
        className={cx(className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>

      <FormField
        className={cx("uitkEmphasisHigh", className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className={cx(className)}
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className={cx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisHigh", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisLow", className)}
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisHigh", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisLow", className)}
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid: Story = () => {
  return <AllExamplesGrid className="backwardsCompat" />;
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllExamplesGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/FormField-vr-snapshot.png"
    />
  );
};

export const WrappingInputs: ComponentStory<typeof FormField> = (props) => {
  return (
    <FlexLayout gap={4}>
      <StackLayout gap={4}>
        <FormField label="Form Field with Input" {...props}>
          <Input defaultValue="Value" />
        </FormField>

        <FormField label="Form Field with CheckboxGroup" {...props}>
          <CheckboxGroup legend="Uncontrolled CheckboxGroup">
            <Checkbox defaultChecked label="option 1" value="option-1" />
            <Checkbox defaultChecked label="option 2" value="option-2" />
            <Checkbox label="option 3" value="option-3" />
          </CheckboxGroup>
        </FormField>

        <FormField label="Form Field with RadioButtonGroup" {...props}>
          <RadioButtonGroup legend="Uncontrolled RadioButtonGroup">
            <RadioButton label="option 1" value="option-1" />
            <RadioButton label="option 2" value="option-2" />
            <RadioButton label="option 3" value="option-3" />
          </RadioButtonGroup>
        </FormField>

        <FormField label="Form Field with Switch" {...props}>
          <Switch label="Uncontrolled Switch" defaultValue="Value" />
        </FormField>

        <FormField label="Form Field with Labelless Switch" {...props}>
          <Switch defaultValue="Value" />
        </FormField>
      </StackLayout>
      <StackLayout gap={4}>
        <FormField
          helperText="Some help text"
          label="Form Field with Input"
          {...props}
        >
          <Input defaultValue="Value" />
        </FormField>

        <FormField
          helperText="Some help text"
          label="Form Field with CheckboxGroup"
          {...props}
        >
          <CheckboxGroup legend="Uncontrolled CheckboxGroup">
            <Checkbox defaultChecked label="option 1" value="option-1" />
            <Checkbox defaultChecked label="option 2" value="option-2" />
            <Checkbox label="option 3" value="option-3" />
          </CheckboxGroup>
        </FormField>

        <FormField
          helperText="Some help text"
          label="Form Field with RadioButtonGroup"
          {...props}
        >
          <RadioButtonGroup legend="Uncontrolled RadioButtonGroup">
            <RadioButton label="option 1" value="option-1" />
            <RadioButton label="option 2" value="option-2" />
            <RadioButton label="option 3" value="option-3" />
          </RadioButtonGroup>
        </FormField>

        <FormField
          helperText="Some help text"
          label="Form Field with Switch"
          {...props}
        >
          <Switch label="Uncontrolled Switch" defaultValue="Value" />
        </FormField>

        <FormField
          helperText="Some help text"
          label="Form Field with Labelless Switch"
          {...props}
        >
          <Switch defaultValue="Value" />
        </FormField>
      </StackLayout>
      <StackLayout gap={4}>
        <FormField
          helperText="Some help text"
          labelPlacement="left"
          label="Form Field with Input"
          {...props}
        >
          <Input defaultValue="Value" />
        </FormField>

        <FormField
          helperText="Some help text"
          labelPlacement="left"
          label="Form Field with CheckboxGroup"
          {...props}
        >
          <CheckboxGroup legend="Uncontrolled CheckboxGroup">
            <Checkbox defaultChecked label="option 1" value="option-1" />
            <Checkbox defaultChecked label="option 2" value="option-2" />
            <Checkbox label="option 3" value="option-3" />
          </CheckboxGroup>
        </FormField>

        <FormField
          helperText="Some help text"
          labelPlacement="left"
          label="Form Field with RadioButtonGroup"
          {...props}
        >
          <RadioButtonGroup legend="Uncontrolled RadioButtonGroup">
            <RadioButton label="option 1" value="option-1" />
            <RadioButton label="option 2" value="option-2" />
            <RadioButton label="option 3" value="option-3" />
          </RadioButtonGroup>
        </FormField>

        <FormField
          helperText="Some help text"
          labelPlacement="left"
          label="Form Field with Switch"
          {...props}
        >
          <Switch label="Uncontrolled Switch" defaultValue="Value" />
        </FormField>

        <FormField
          helperText="Some help text"
          labelPlacement="left"
          label="Form Field with Labelless Switch"
          {...props}
        >
          <Switch defaultValue="Value" />
        </FormField>
      </StackLayout>
    </FlexLayout>
  );
};

import {
  Checkbox,
  CheckboxGroup,
  RadioButton,
  RadioButtonGroup,
  FlowLayout,
} from "@salt-ds/core";
import {
  FormFieldControlWrapper as Controls,
  FormFieldHelperText as HelperText,
  FormFieldLabel as Label,
  FormFieldNext,
  InputNext,
} from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Form Field Next",
  component: FormFieldNext,
} as ComponentMeta<typeof FormFieldNext>;

export const Skeleton: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout>
      <FormFieldNext {...props}>
        <Label>Default Form Field label</Label>
        <HelperText>Default helper text</HelperText>
      </FormFieldNext>
      <FormFieldNext labelPlacement="left" {...props}>
        <Label>Default Form Field label</Label>
        <HelperText>Default helper text</HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Default: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <Label>Form Field label</Label>
        <InputNext defaultValue="Value" />
        <HelperText>Default helper text</HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Disabled: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext disabled {...props}>
        <Label>Disabled Form Field</Label>
        <InputNext defaultValue="Primary Input value" />
        <HelperText>This field has been disabled</HelperText>
      </FormFieldNext>
      <FormFieldNext disabled {...props}>
        <Label>Disabled Form Field</Label>
        <InputNext variant="secondary" defaultValue="Secondary Input value" />
        <HelperText>This field has been disabled</HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const LabelPlacement: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <Label>Form Field label top (default)</Label>
        <InputNext defaultValue="Value" />
        <HelperText>Default helper text</HelperText>
      </FormFieldNext>
      <FormFieldNext labelPlacement="left" {...props}>
        <Label>Form Field label left</Label>
        <InputNext defaultValue="Value" />
        <HelperText>Default helper text</HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const LongLabelPlacement: ComponentStory<typeof FormFieldNext> = (
  props
) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <Label>
          Form Field label that's extra long. Showing that labels wrap around to
          the next line.
        </Label>
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <FormFieldNext labelPlacement="left" {...props}>
        <Label>
          Form Field label that's extra long. Showing that labels wrap around to
          the next line.
        </Label>
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <FormFieldNext {...props}>
        <Label>Default Form Field label</Label>
        <InputNext defaultValue="Primary Input value" />
        <HelperText>
          Helper text that's very long. Additional text to give further context
          to the input requirements.
        </HelperText>
      </FormFieldNext>
      <FormFieldNext labelPlacement="left" {...props}>
        <Label>Default Form Field label</Label>
        <InputNext defaultValue="Primary Input value" />
        <HelperText>
          Helper text that's very long. Additional text to give further context
          to the input requirements.
        </HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

/* TODO: These issues (in helper text) need consideration */

export const MultiInput: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext {...props}>
        <Label>Paired fields</Label>
        <Controls>
          <InputNext variant="secondary" defaultValue="123" />
          <InputNext variant="secondary" defaultValue="35" />
        </Controls>
        <HelperText>
          *User entry in either field will automatically populate the
          corresponding field with the correct value
        </HelperText>
      </FormFieldNext>
      <FormFieldNext {...props}>
        <Label>Multi criteria inputs</Label>
        <Controls>
          <InputNext variant="secondary" defaultValue="2.5" />
          <InputNext variant="secondary" defaultValue="750" />
        </Controls>
        <HelperText>
          *User must enter all values in the string to complete the input
        </HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Readonly: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext readOnly {...props}>
        <Label>Readonly Form Field</Label>
        <InputNext defaultValue="Primary Input value" />
        <HelperText>This Form Field is readonly</HelperText>
      </FormFieldNext>
      <FormFieldNext readOnly {...props}>
        <Label>Readonly Form Field</Label>
        <InputNext variant="secondary" defaultValue="Secondary Input value" />
        <HelperText>This Form Field is readonly</HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const WithFormControlExamples: ComponentStory<typeof FormFieldNext> = (
  props
) => {
  return (
    <FlowLayout style={{ width: "50vw" }}>
      <FormFieldNext labelPlacement="left" {...props}>
        <Label>Form Field label for Checkbox</Label>
        <Checkbox label={"Checkbox"} />
        <HelperText>Helper text</HelperText>
      </FormFieldNext>
      <FormFieldNext labelPlacement="left" {...props}>
        <Label>Form Field label for Radio Button</Label>
        <RadioButton label={"Radio Button"} />
        <HelperText>Helper text</HelperText>
      </FormFieldNext>
      <FormFieldNext {...props}>
        <Label>Form Field label for Checkbox Group</Label>
        <CheckboxGroup>
          <Checkbox label="Option 1" />
          <Checkbox defaultChecked label="Option 2" />
          <Checkbox label="Option 3" />
        </CheckboxGroup>
        <HelperText>Helper text</HelperText>
      </FormFieldNext>
      <FormFieldNext {...props}>
        <Label>Form Field label for Radio Button Group</Label>
        <RadioButtonGroup>
          <RadioButton key="option1" label="Radio Option 1" value="option1" />
          <RadioButton key="option2" label="Radio Option 2" value="option2" />
          <RadioButton key="option3" label="Radio Option 3" value="option3" />
        </RadioButtonGroup>
        <HelperText>Helper text</HelperText>
      </FormFieldNext>
    </FlowLayout>
  );
};

export const WithValidation: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext validationStatus="error" {...props}>
        <Label>Error Form Field</Label>
        <InputNext defaultValue="Input value" />
        <HelperText>Helper text</HelperText>
      </FormFieldNext>
      <FormFieldNext validationStatus="warning" {...props}>
        <Label>Warning Form Field</Label>
        <InputNext defaultValue="Input value" />
        <HelperText>Helper text</HelperText>
      </FormFieldNext>
      <FormFieldNext validationStatus="success" {...props}>
        <Label>Success Form Field</Label>
        <InputNext defaultValue="Input value" />
        <HelperText>Helper text</HelperText>
      </FormFieldNext>
      {/* TODO: Guidance to explain that the following would produce broken design/behaviour
      
      
      Error readOnly Input
      <FormFieldNext
        validationStatus="error"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <InputNext readOnly defaultValue="Input value" />
      </FormFieldNext>
      Warning disabled Input
      <FormFieldNext
        validationStatus="warning"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <InputNext disabled defaultValue="Input value" />
      </FormFieldNext> */}
    </FlowLayout>
  );
};

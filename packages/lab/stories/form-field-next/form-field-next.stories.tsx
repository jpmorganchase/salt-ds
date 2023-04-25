import {
  Checkbox,
  GridLayout,
  GridItem,
  RadioButton,
  RadioButtonGroup,
  FlexLayout,
  FlowLayout,
} from "@salt-ds/core";
import { FormFieldNext, InputNext } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Form Field Next",
  component: FormFieldNext,
} as ComponentMeta<typeof FormFieldNext>;

export const Skeleton: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout>
      <FormFieldNext
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      ></FormFieldNext>
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      ></FormFieldNext>
    </FlowLayout>
  );
};

export const Default: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <FormFieldNext
        labelPlacement="left"
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label with more text"
        helperText="Default helper text"
        {...props}
      >
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <FormFieldNext label="Default Form Field label" {...props}>
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <FormFieldNext label="Default Form Field label" {...props}>
        <InputNext variant="secondary" defaultValue="Value" />
      </FormFieldNext>
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Value" />
      </FormFieldNext>
    </FlowLayout>
  );
};

export const WithControls: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext defaultValue="Value" />
        <Checkbox label={"Checkbox"} />
        <RadioButton label={"Radio Button"} />
      </FormFieldNext>
      <FormFieldNext
        labelPlacement="left"
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Value" />
        <InputNext variant="secondary" defaultValue="Value 2" />
      </FormFieldNext>
      <FormFieldNext
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <RadioButtonGroup>
          <RadioButton key="option1" label="Radio Option 1" value="option1" />
          <RadioButton key="option2" label="Radio Option 2" value="option2" />
          <RadioButton key="option3" label="Radio Option 3" value="option3" />
        </RadioButtonGroup>
      </FormFieldNext>
    </FlowLayout>
  );
};

/* TODO: These issues (in helper text) need consideration */

export const MultiInput: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext
        label="Paired fields"
        helperText="*User entry in either field will automatically populate the corresponding field with the correct value"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="123" />
        <InputNext variant="secondary" defaultValue="35" />
      </FormFieldNext>
      <FormFieldNext
        label="Multi criteria inputs"
        helperText="*User must enter all values in the string to complete the input"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="2.5" />
        <InputNext variant="secondary" defaultValue="750" />
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Disabled: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext
        disabled
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <FormFieldNext
        disabled
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Secondary Input value" />
      </FormFieldNext>
    </FlowLayout>
  );
};

export const Readonly: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext
        readOnly
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <FormFieldNext
        readOnly
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Secondary Input value" />
      </FormFieldNext>
    </FlowLayout>
  );
};

export const LongLabelsWithWrap: ComponentStory<typeof FormFieldNext> = (
  props
) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext
        label="Form Field label that's extra long. Showing that labels wrap around to the next line."
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <FormFieldNext
        readOnly
        label="Form Field label"
        helperText="Helper text that's very long. Additional text explaining that this is a readonly Form Field."
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
    </FlowLayout>
  );
};

export const WithValidation: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <FlowLayout style={{ width: "366px" }}>
      <FormFieldNext
        validationStatus="error"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <InputNext validationStatus="error" defaultValue="Input value" />
      </FormFieldNext>
      <FormFieldNext
        validationStatus="warning"
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <InputNext validationStatus="warning" defaultValue="Input value" />
      </FormFieldNext>
      {/*  This would be possible. Is this ok?
      
      <FormFieldNext
        readOnly
        label="Form Field label"
        helperText="Helper text"
        {...props}
      >
        <InputNext validationStatus="error" defaultValue="Input value" />
      </FormFieldNext> */}
    </FlowLayout>
  );
};

import { Checkbox, RadioButton, RadioButtonGroup } from "@salt-ds/core";
import { FormFieldNext, InputNext } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Form Field Next",
  component: FormFieldNext,
} as ComponentMeta<typeof FormFieldNext>;

export const Skeleton: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <div style={{ width: "366px" }}>
      <div style={{ height: 16 }} />
      <FormFieldNext
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      ></FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      ></FormFieldNext>
    </div>
  );
};

export const Default: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <>
      <FormFieldNext
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label with more text"
        helperText="Default helper text"
        {...props}
      >
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext label="Default Form Field label" {...props}>
        <InputNext defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext label="Default Form Field label" {...props}>
        <InputNext variant="secondary" defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Value" />
      </FormFieldNext>
    </>
  );
};

export const WithControls: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <>
      <FormFieldNext
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext defaultValue="Value" />
        <Checkbox label={"Checkbox"} />
        <RadioButton label={"Radio Button"} />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Value" />
        <InputNext variant="secondary" defaultValue="Value 2" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
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
    </>
  );
};

/* TODO: These issues (in helper text) need consideration */

export const MultiInput: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <div style={{ width: "366px" }}>
      <div style={{ height: 16 }} />
      <FormFieldNext
        label="Paired fields"
        helperText="*User entry in either field will automatically populate the corresponding field with the correct value"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="123" />
        <InputNext variant="secondary" defaultValue="35" />
      </FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        label="Multi criteria inputs"
        helperText="*User must enter all values in the string to complete the input"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="2.5" />
        <InputNext variant="secondary" defaultValue="750" />
      </FormFieldNext>
    </div>
  );
};

export const Disabled: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <div style={{ width: "366px" }}>
      <div style={{ height: 16 }} />
      <FormFieldNext
        disabled
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        disabled
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Secondary Input value" />
      </FormFieldNext>
    </div>
  );
};

export const Readonly: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <div style={{ width: "366px" }}>
      <div style={{ height: 16 }} />
      <FormFieldNext
        readOnly
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        readOnly
        label="Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <InputNext variant="secondary" defaultValue="Secondary Input value" />
      </FormFieldNext>
    </div>
  );
};

export const LongLabelsWithWrap: ComponentStory<typeof FormFieldNext> = (
  props
) => {
  return (
    <div style={{ width: "366px" }}>
      <div style={{ height: 16 }} />
      <FormFieldNext
        readOnly
        label="Form Field label that's extra long: Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
      <div style={{ height: 16 }} />
      <FormFieldNext
        readOnly
        label="Form Field label"
        helperText="Helper text that's very long: Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        {...props}
      >
        <InputNext defaultValue="Primary Input value" />
      </FormFieldNext>
    </div>
  );
};

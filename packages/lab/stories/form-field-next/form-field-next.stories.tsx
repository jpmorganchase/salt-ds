import { Checkbox, RadioButton } from "@salt-ds/core";
import { FormFieldNext, Input } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Form Field Next",
  component: FormFieldNext,
} as ComponentMeta<typeof FormFieldNext>;

export const Default: ComponentStory<typeof FormFieldNext> = (props) => {
  return (
    <>
      <FormFieldNext
        helperText="Default helper text"
        label="Default Form Field label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        label="Default Form Field label"
        {...props}
      >
        <Input defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        label="Default Form Field label"
        {...props}
      >
        <Input variant="secondary" defaultValue="Value" />
      </FormFieldNext>
      <div style={{ height: 40 }} />
      <FormFieldNext
        labelPlacement="left"
        label="Default Form Field label"
        helperText="Default helper text"
        {...props}
      >
        <Input variant="secondary" defaultValue="Value" />
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
          <Input defaultValue="Value" />
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
          <Input variant="secondary" defaultValue="Value" />
          <Input variant="secondary" defaultValue="Value 2" />
        </FormFieldNext>
      </>
    );
  };
  
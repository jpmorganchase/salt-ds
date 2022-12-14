import { FormField, Input } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Form Field/QA",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const FormFieldWithFocus: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer {...props} itemPadding={6}>
      <FormField
        label="Default Form Field description label"
        className="saltFormField-focused"
      >
        <Input value="Value" />
      </FormField>

      <FormField
        className="saltFormField-secondary saltFormField-focused"
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className="saltFormField-focused"
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className="saltFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormField-secondary saltFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormField-tertiary saltFormField-focused"
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormField-tertiary saltFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormField-secondary saltFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormField-tertiary saltFormField-focused"
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

FormFieldWithFocus.parameters = {
  chromatic: { disableSnapshot: false },
};

import { FormField, Input } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Form Field Legacy/QA",
  component: FormField,
} as Meta<typeof FormField>;

export const FormFieldWithFocus: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer {...props} itemPadding={6}>
      <FormField
        label="Default Form Field description label"
        className="saltFormFieldLegacy-focused"
      >
        <Input value="Value" />
      </FormField>

      <FormField
        className="saltFormFieldLegacy-secondary saltFormFieldLegacy-focused"
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className="saltFormFieldLegacy-focused"
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className="saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormFieldLegacy-secondary saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormFieldLegacy-tertiary saltFormFieldLegacy-focused"
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormFieldLegacy-tertiary saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormFieldLegacy-secondary saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className="saltFormFieldLegacy-tertiary saltFormFieldLegacy-focused"
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

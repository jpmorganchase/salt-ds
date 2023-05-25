import { FormFieldLegacy, Input } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Form Field/QA",
  component: FormFieldLegacy,
} as ComponentMeta<typeof FormFieldLegacy>;

export const FormFieldLegacyWithFocus: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer {...props} itemPadding={6}>
      <FormFieldLegacy
        label="Default Form Field description label"
        className="saltFormFieldLegacy-focused"
      >
        <Input value="Value" />
      </FormFieldLegacy>

      <FormFieldLegacy
        className="saltFormFieldLegacy-secondary saltFormFieldLegacy-focused"
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormFieldLegacy>
      <FormFieldLegacy
        className="saltFormFieldLegacy-focused"
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormFieldLegacy>
      <FormFieldLegacy
        className="saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className="saltFormFieldLegacy-secondary saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className="saltFormFieldLegacy-tertiary saltFormFieldLegacy-focused"
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className="saltFormFieldLegacy-tertiary saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className="saltFormFieldLegacy-secondary saltFormFieldLegacy-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className="saltFormFieldLegacy-tertiary saltFormFieldLegacy-focused"
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormFieldLegacy>
    </QAContainer>
  );
};

FormFieldLegacyWithFocus.parameters = {
  chromatic: { disableSnapshot: false },
};

import { FormField, Input } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Form Field/QA",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const FormFieldWithFocus: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer {...props} itemPadding={6}>
      <FormField
        label="Default Form Field description label"
        className="uitkFormField-focused"
      >
        <Input value="Value" />
      </FormField>

      <FormField
        className="uitkEmphasisHigh uitkFormField-focused"
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className="uitkFormField-focused"
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className="uitkFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisHigh uitkFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisLow uitkFormField-focused"
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisLow uitkFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="error"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisHigh uitkFormField-focused"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="error"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisLow uitkFormField-focused"
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="error"
      >
        <Input />
      </FormField>
    </QAContainer>
  );
};

FormFieldWithFocus.parameters = {
  chromatic: { disableSnapshot: false },
};

import { clsx } from "clsx";
import { FormFieldLegacy, Input } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Form Field/QA",
  component: FormFieldLegacy,
} as ComponentMeta<typeof FormFieldLegacy>;

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  const { imgSrc, className } = props;
  return (
    <QAContainer imgSrc={imgSrc}>
      <FormFieldLegacy
        className={clsx(className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormFieldLegacy>

      <FormFieldLegacy
        className={clsx("saltFormFieldLegacy-secondary", className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormFieldLegacy>
      <FormFieldLegacy
        className={clsx(className)}
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormFieldLegacy>
      <FormFieldLegacy
        className={clsx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className={clsx("saltFormFieldLegacy-secondary", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className={clsx("saltFormFieldLegacy-tertiary", className)}
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className={clsx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className={clsx("saltFormFieldLegacy-secondary", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormFieldLegacy>
      <FormFieldLegacy
        className={clsx("saltFormFieldLegacy-tertiary", className)}
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

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

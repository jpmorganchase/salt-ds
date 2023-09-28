import { clsx } from "clsx";
import { FormField, Input } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Form Field Legacy/QA",
  component: FormField,
} as Meta<typeof FormField>;

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { imgSrc, className } = props;
  return (
    <QAContainer imgSrc={imgSrc}>
      <FormField
        className={clsx(className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className={clsx("saltFormFieldLegacy-secondary", className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className={clsx(className)}
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className={clsx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={clsx("saltFormFieldLegacy-secondary", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={clsx("saltFormFieldLegacy-tertiary", className)}
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={clsx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className={clsx("saltFormFieldLegacy-secondary", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className={clsx("saltFormFieldLegacy-tertiary", className)}
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

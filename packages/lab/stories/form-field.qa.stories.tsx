import cx from "classnames";
import { FormField, Input } from "@salt-ds/lab";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Form Field/QA",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  const { imgSrc, className } = props;
  return (
    <QAContainer imgSrc={imgSrc}>
      <FormField
        className={cx(className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>

      <FormField
        className={cx("uitkFormField-secondary", className)}
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className={cx(className)}
        label="Label aligned left"
        labelPlacement="left"
      >
        <Input value="Value" />
      </FormField>
      <FormField
        className={cx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkFormField-secondary", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkFormField-tertiary", className)}
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkFormField-secondary", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationStatus="error"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkFormField-tertiary", className)}
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

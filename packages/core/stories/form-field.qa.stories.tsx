import cx from "classnames";
import { FormField, Input } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Form Field/QA",
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
        className={cx("uitkEmphasisHigh", className)}
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
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisHigh", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisLow", className)}
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className={cx(className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="error"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisHigh", className)}
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="error"
      >
        <Input />
      </FormField>
      <FormField
        className={cx("uitkEmphasisLow", className)}
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

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid: Story = () => {
  return <AllExamplesGrid className="backwardsCompat" />;
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllExamplesGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/FormField-vr-snapshot.png"
    />
  );
};

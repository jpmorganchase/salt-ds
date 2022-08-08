import { FormField, Input } from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Core/Form Field/QA",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer {...props}>
      <FormField label="Default Form Field description label">
        <Input value="Value" />
      </FormField>

      <FormField
        className="uitkEmphasisHigh"
        label="Default Form Field description label"
      >
        <Input value="Value" />
      </FormField>
      <FormField label="Label aligned left" labelPlacement="left">
        <Input value="Value" />
      </FormField>
      <FormField
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisHigh"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisLow"
        hasStatusIndicator
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="warning"
      >
        <Input />
      </FormField>
      <FormField
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="error"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisHigh"
        helperText="Warning helper text"
        label="Warning Form Field"
        validationState="error"
      >
        <Input />
      </FormField>
      <FormField
        className="uitkEmphasisLow"
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

export const CompareWithOriginalToolkit: Story = () => {
  return (
    <AllExamplesGrid imgSrc="/visual-regression-screenshots/FormField-vr-snapshot.png" />
  );
};

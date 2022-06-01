import { FormField, Input } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";
import "./form-field.qa.stories.css";

export default {
  title: "Lab/Form Field/QA",
  component: FormField,
} as ComponentMeta<typeof FormField>;

export const AllExamplesGrid: ComponentStory<typeof FormField> = (props) => {
  return (
    <AllRenderer>
      <div
        style={{
          background: "inherit",
          display: "inline-grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "4px",
        }}
      >
        <FormField label="Default Form Field description label">
          <Input value="Value" />
        </FormField>

        <FormField
          label="Default Form Field description label"
          className="uitkEmphasisHigh"
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
          helperText="Warning helper text"
          label="Warning Form Field"
          validationState="warning"
          className="uitkEmphasisHigh"
        >
          <Input />
        </FormField>
        <FormField
          hasStatusIndicator
          helperText="Warning helper text"
          label="Warning Form Field"
          validationState="warning"
          className="uitkEmphasisLow"
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
          helperText="Warning helper text"
          label="Warning Form Field"
          validationState="error"
          className="uitkEmphasisHigh"
        >
          <Input />
        </FormField>
        <FormField
          hasStatusIndicator
          helperText="Warning helper text"
          label="Warning Form Field"
          validationState="error"
          className="uitkEmphasisLow"
        >
          <Input />
        </FormField>
      </div>
    </AllRenderer>
  );
};

export const CompareWithOriginalToolkit: ComponentStory<typeof FormField> = (
  props
) => {
  return (
    <QAContainer
      width={1272}
      height={894}
      className="uitkFormFieldQA"
      imgSrc="/visual-regression-screenshots/FormField-vr-snapshot.png"
    >
      <AllExamplesGrid />
    </QAContainer>
  );
};

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
        <FormField
          label="Default Form Field description label"
          className="backwardsCompat"
        >
          <Input value="Value" />
        </FormField>

        <FormField
          label="Default Form Field description label"
          className="uitkEmphasisHigh backwardsCompat"
        >
          <Input value="Value" />
        </FormField>
        <FormField
          label="Label aligned left"
          labelPlacement="left"
          className="backwardsCompat"
        >
          <Input value="Value" />
        </FormField>
        <FormField
          className="backwardsCompat"
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
          className="uitkEmphasisHigh backwardsCompat"
        >
          <Input />
        </FormField>
        <FormField
          hasStatusIndicator
          helperText="Warning helper text"
          label="Warning Form Field"
          validationState="warning"
          className="uitkEmphasisLow backwardsCompat"
        >
          <Input />
        </FormField>
        <FormField
          className="backwardsCompat"
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
          className="uitkEmphasisHigh backwardsCompat"
        >
          <Input />
        </FormField>
        <FormField
          hasStatusIndicator
          helperText="Warning helper text"
          label="Warning Form Field"
          validationState="error"
          className="uitkEmphasisLow backwardsCompat"
        >
          <Input />
        </FormField>
      </div>
    </AllRenderer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
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

import { FormField, FormFieldLabel, FormFieldHelperText } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Form Field/Form Field QA",
  component: FormField,
} as Meta<typeof FormField>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} cols={2} {...props}>
    <FormField {...props}>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField labelPlacement="left" {...props}>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection height={500} width={1000} cols={2} {...props}>
    <FormField {...props}>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField labelPlacement="left" {...props}>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

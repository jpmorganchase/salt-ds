import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
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
    <FormField labelPlacement="left" validationStatus="error" {...props}>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField validationStatus="success" {...props}>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField labelPlacement="left" validationStatus="warning" {...props}>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
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

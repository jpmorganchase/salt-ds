import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
  GridLayout,
  Input,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Form Field/Form Field QA",
  component: FormField,
} as Meta<typeof FormField>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={1200} itemPadding={10} width={1200} cols={1} {...props}>
    <GridLayout columns={2}>
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
    </GridLayout>
    <GridLayout columns={3}>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
        <FormHelperText>Helper text</FormHelperText>
      </FormField>
      <FormField {...props}>
        <FormLabel>Form Field label</FormLabel>
        <Input defaultValue="Value" />
      </FormField>
    </GridLayout>
    <GridLayout columns={1}>
      <FormField {...props}>
        <Input defaultValue="Value" />
      </FormField>
    </GridLayout>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};

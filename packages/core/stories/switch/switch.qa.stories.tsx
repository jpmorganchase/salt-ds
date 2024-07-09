import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  Switch,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Switch/Switch QA",
  component: Switch,
} as Meta<typeof Switch>;

export const AllExamplesGrid: StoryFn<
  QAContainerProps & { className?: string }
> = (props) => {
  const { className } = props;
  return (
    <QAContainer cols={4} {...props}>
      <Switch className={className} label="Default" />
      <Switch className={className} checked label="Checked" />
      <Switch className={className} disabled label="Disabled" />
      <Switch
        className={className}
        checked
        disabled
        label="Checked + Disabled"
      />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
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

export const FormFieldAlignments: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} cols={2} {...props}>
    <FormField labelPlacement="left">
      <FormFieldLabel>Reference</FormFieldLabel>
      <Input defaultValue="Value" />
      <FormFieldHelperText>Helpertext</FormFieldHelperText>
    </FormField>
    <FormField labelPlacement="left">
      <FormFieldLabel>Label</FormFieldLabel>
      <Switch />
      <FormFieldHelperText>Helpertext</FormFieldHelperText>
    </FormField>
    <FormField labelPlacement="right">
      <FormFieldLabel>Reference</FormFieldLabel>
      <Input defaultValue="Value" />
      <FormFieldHelperText>Helpertext</FormFieldHelperText>
    </FormField>
    <FormField labelPlacement="right">
      <FormFieldLabel>Label</FormFieldLabel>
      <Switch />
      <FormFieldHelperText>Helpertext</FormFieldHelperText>
    </FormField>
  </QAContainer>
);
FormFieldAlignments.parameters = {
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

export const NoStyleInjectionGrid: StoryFn<
  QAContainerNoStyleInjectionProps
> = ({ className, ...restProps }) => (
  <QAContainerNoStyleInjection cols={4} {...restProps}>
    <Switch className={className} label="Default" />
    <Switch className={className} checked label="Checked" />
    <Switch className={className} disabled label="Disabled" />
    <Switch className={className} checked disabled label="Checked + Disabled" />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Pill,
  PillGroup,
} from "@salt-ds/core";
import { FavoriteIcon, UserBadgeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Core/Pill/Pill Group",
  component: Pill,
} as Meta<typeof Pill>;

export const Default: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup aria-label="Group label" {...args}>
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

const lotsOfPills = Array.from({ length: 20 }).map(
  (_, index) => `Pill ${index + 1}`,
);

export const WithWrap: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup {...args} aria-label="Group label" style={{ maxWidth: 250 }}>
      {lotsOfPills.map((pill) => (
        <Pill key={pill} value={pill}>
          {pill}
        </Pill>
      ))}
    </PillGroup>
  );
};

export const WithIcon: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup {...args} aria-label="Group label">
      <Pill value="one">
        <UserBadgeIcon aria-hidden />
        Pill 1
      </Pill>
      <Pill value="two">
        <FavoriteIcon aria-hidden />
        Pill 2
      </Pill>
    </PillGroup>
  );
};

export const WithFormField: StoryFn<typeof PillGroup> = (args) => {
  return (
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <PillGroup {...args}>
        <Pill value="one">Pill 1</Pill>
        <Pill value="two">Pill 2</Pill>
        <Pill value="three">Pill 3</Pill>
      </PillGroup>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  );
};

export const Disabled: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup {...args} aria-label="Group label" disabled>
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const WithDisabledFormField: StoryFn<typeof PillGroup> = (args) => {
  return (
    <FormField disabled>
      <FormFieldLabel>Field label</FormFieldLabel>
      <PillGroup {...args}>
        <Pill value="one">Pill 1</Pill>
        <Pill value="two">Pill 2</Pill>
        <Pill value="three">Pill 3</Pill>
      </PillGroup>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  );
};

export const SelectableGroup: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup aria-label="Group label" {...args} selectionVariant="multiple">
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const DisabledSelectableGroup: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup
      disabled
      aria-label="Group label"
      {...args}
      selectionVariant="multiple"
    >
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const ControlledSelectableGroup: StoryFn<typeof PillGroup> = (args) => {
  const [selected, setSelected] = useState<string[]>(["one", "three"]);
  return (
    <PillGroup
      {...args}
      aria-label="Group label"
      selectionVariant="multiple"
      selected={selected}
      onSelectionChange={(_e, newSelected) => setSelected(newSelected)}
    >
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const SelectableGroupWithDisabledPill: StoryFn<typeof PillGroup> = (
  args,
) => {
  return (
    <PillGroup {...args} selectionVariant="multiple" aria-label="Group label">
      <Pill value="one" disabled>
        Pill 1
      </Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

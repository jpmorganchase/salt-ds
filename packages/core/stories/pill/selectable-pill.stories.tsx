import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Pill,
  PillGroup,
} from "@salt-ds/core";

import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Core/Pill/Selectable",
  component: Pill,
} as Meta<typeof Pill>;

export const Default: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup {...args}>
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const WithWrap = () => {
  return (
    <PillGroup style={{ maxWidth: 250 }}>
      {Array.from({ length: 20 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Mock data
        <Pill key={index} value={`pill-${index}`}>
          Pill {index + 1}
        </Pill>
      ))}
    </PillGroup>
  );
};

export const WithFormField = () => {
  return (
    <FormField>
      <FormFieldLabel>Field label</FormFieldLabel>
      <PillGroup
        onSelectionChange={(_e, selected) => {
          console.log("Selected values: ", selected);
        }}
      >
        <Pill value="one">Pill 1</Pill>
        <Pill value="two">Pill 2</Pill>
        <Pill value="three">Pill 3</Pill>
      </PillGroup>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  );
};

export const Disabled = () => {
  return (
    <PillGroup disabled>
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const WithDisabledFormField = () => {
  return (
    <FormField disabled>
      <FormFieldLabel>Field label</FormFieldLabel>
      <PillGroup>
        <Pill value="one">Pill 1</Pill>
        <Pill value="two">Pill 2</Pill>
        <Pill value="three">Pill 3</Pill>
      </PillGroup>
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  );
};

export const ControlledGroup: StoryFn<typeof PillGroup> = (args) => {
  const [selected, setSelected] = useState<string[]>(["one", "three"]);
  return (
    <PillGroup
      {...args}
      selected={selected}
      onSelectionChange={(_e, newSelected) => setSelected(newSelected)}
    >
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const UncontrolledGroup: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup {...args}>
      <Pill value="one">Pill 1</Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

export const WithDisabledPill: StoryFn<typeof PillGroup> = (args) => {
  return (
    <PillGroup {...args}>
      <Pill value="one" disabled>
        Pill 1
      </Pill>
      <Pill value="two">Pill 2</Pill>
      <Pill value="three">Pill 3</Pill>
    </PillGroup>
  );
};

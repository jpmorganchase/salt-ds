import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Pill,
  PillGroup,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const SelectableFormField = (): ReactElement => (
  <FormField style={{ maxWidth: "40ch" }}>
    <FormFieldLabel>Select skills</FormFieldLabel>
    <PillGroup
      onSelectionChange={(_e, selected) => {
        console.log("Selected values: ", selected);
      }}
    >
      <Pill value="html">HTML/CSS</Pill>
      <Pill value="visualDesign">Visual Design</Pill>
      <Pill value="informationArchitecture">Information Architecture</Pill>
      <Pill value="react">React</Pill>
      <Pill value="userResearch">User Research</Pill>
    </PillGroup>
    <FormFieldHelperText>
      Choose the skills that best represent your skill set.
    </FormFieldHelperText>
  </FormField>
);

import { FormField, FormFieldLabel, Pill, PillGroup } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Grouped = (): ReactElement => (
  <FormField style={{ width: "max-content" }}>
    <FormFieldLabel>Locations</FormFieldLabel>
    <PillGroup>
      <Pill value="namr">North America</Pill>
      <Pill value="apac">Asia, Pacific</Pill>
      <Pill value="emea">Europe, Middle East, and Africa</Pill>
    </PillGroup>
  </FormField>
);

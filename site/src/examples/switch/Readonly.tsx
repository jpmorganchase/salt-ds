import { FormField, FormFieldLabel, StackLayout, Switch } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Readonly = (): ReactElement => (
  <StackLayout>
    <FormField>
      <FormFieldLabel>Reminders (Read-only)</FormFieldLabel>
      <Switch readOnly label="Off" />
    </FormField>
    <Switch readOnly checked label="Reminders" />
  </StackLayout>
);

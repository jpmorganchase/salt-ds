import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  StackLayout,
  Switch,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Readonly = (): ReactElement => (
  <FlexLayout align="end">
    <StackLayout>
      <Switch readOnly aria-label="Reminders" />
      <Switch readOnly checked aria-label="Reminders" />
    </StackLayout>
    <StackLayout>
      <FormField>
        <FormFieldLabel>Reminders (Read-only)</FormFieldLabel>
        <Switch readOnly label="Off" />
      </FormField>
      <Switch readOnly checked label="Reminders" />
    </StackLayout>
  </FlexLayout>
);

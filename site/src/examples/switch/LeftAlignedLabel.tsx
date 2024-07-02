import { FormField, FormFieldLabel, Switch } from "@salt-ds/core";
import type { ReactElement } from "react";

export const LeftAlignedLabel = (): ReactElement => (
  <div>
    <FormField labelPlacement="left">
      <FormFieldLabel>Active</FormFieldLabel>
      <Switch />
    </FormField>
  </div>
);

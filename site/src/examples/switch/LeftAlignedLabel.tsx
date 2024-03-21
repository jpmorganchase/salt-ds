import { ReactElement } from "react";
import { FormField, FormFieldLabel, Switch } from "@salt-ds/core";

export const LeftAlignedLabel = (): ReactElement => (
  <>
    <FormField labelPlacement="left">
      <FormFieldLabel>Active</FormFieldLabel>
      <Switch />
    </FormField>
  </>
);

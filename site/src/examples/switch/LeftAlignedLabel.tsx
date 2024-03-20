import { ReactElement } from "react";
import { FormField, FormFieldLabel, Switch } from "@salt-ds/core";

export const LeftAlignedLabel = (): ReactElement => (
  <>
    <FormField labelPlacement="left">
      <FormFieldLabel className="saltSwitch-label">Active</FormFieldLabel>
      <Switch />
    </FormField>
  </>
);

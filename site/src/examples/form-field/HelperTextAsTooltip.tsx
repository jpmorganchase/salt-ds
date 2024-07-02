import { FormField, FormFieldLabel, Input, Tooltip } from "@salt-ds/core";
import type { ReactElement } from "react";

export const HelperTextAsTooltip = (): ReactElement => (
  <FormField style={{ width: "256px" }}>
    <FormFieldLabel>Form Field label</FormFieldLabel>
    <Tooltip content="Helper text">
      <Input defaultValue="Value" />
    </Tooltip>
  </FormField>
);

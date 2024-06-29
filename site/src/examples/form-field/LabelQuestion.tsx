import {
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const LabelQuestion = (): ReactElement => (
  <FlowLayout style={{ width: "366px" }}>
    <FormField>
      <FormFieldLabel intent="sentence">
        Do your current qualifications align with the role? Please describe.
      </FormFieldLabel>
      <MultilineInput bordered defaultValue="Answer" />
    </FormField>
  </FlowLayout>
);

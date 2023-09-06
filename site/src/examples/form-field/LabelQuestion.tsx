import { ReactElement } from "react";
import {
  FormField,
  FlowLayout,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
  MultilineInput,
} from "@salt-ds/core";

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

import { FlowLayout, MultilineInput } from "@salt-ds/core";
import type { ReactElement } from "react";

export const ValidationStatus = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <MultilineInput validationStatus="error" defaultValue="Value" />
    <MultilineInput bordered validationStatus="error" defaultValue="Value" />
    <MultilineInput validationStatus="warning" defaultValue="Value" />
    <MultilineInput bordered validationStatus="warning" defaultValue="Value" />
    <MultilineInput validationStatus="success" defaultValue="Value" />
    <MultilineInput bordered validationStatus="success" defaultValue="Value" />
  </FlowLayout>
);

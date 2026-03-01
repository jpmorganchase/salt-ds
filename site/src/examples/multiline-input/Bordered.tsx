import { MultilineInput, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <StackLayout style={{ maxWidth: "256px" }}>
    <MultilineInput bordered defaultValue="Value" />
    <MultilineInput bordered variant="secondary" defaultValue="Value" />
    <MultilineInput bordered variant="tertiary" defaultValue="Value" />
  </StackLayout>
);

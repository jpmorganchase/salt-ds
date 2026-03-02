import { MultilineInput, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <StackLayout style={{ maxWidth: "256px" }}>
    <MultilineInput bordered variant="primary" defaultValue="Primary" />
    <MultilineInput bordered variant="secondary" defaultValue="Secondary" />
    <MultilineInput bordered variant="tertiary" defaultValue="Tertiary" />
  </StackLayout>
);

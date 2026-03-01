import { MultilineInput, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <StackLayout style={{ maxWidth: "256px" }}>
    <MultilineInput variant="primary" defaultValue="Value" />
    <MultilineInput variant="secondary" defaultValue="Value" />
    <MultilineInput variant="tertiary" defaultValue="Value" />
  </StackLayout>
);

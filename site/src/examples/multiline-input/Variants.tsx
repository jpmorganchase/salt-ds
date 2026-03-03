import { MultilineInput, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <StackLayout style={{ maxWidth: "256px" }}>
    <MultilineInput variant="primary" defaultValue="Primary" />
    <MultilineInput variant="secondary" defaultValue="Secondary" />
    <MultilineInput variant="tertiary" defaultValue="Tertiary" />
  </StackLayout>
);

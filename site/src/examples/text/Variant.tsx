import { StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Variant = (): ReactElement => (
  <StackLayout>
    <Text variant="primary">This is primary variant of Text</Text>
    <Text variant="secondary">This is secondary variant of Text</Text>
  </StackLayout>
);

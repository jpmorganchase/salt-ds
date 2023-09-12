import { ReactElement } from "react";
import { Text, StackLayout } from "@salt-ds/core";

export const Variant = (): ReactElement => (
  <StackLayout>
    <Text variant="primary">This is primary variant of Text</Text>
    <Text variant="secondary">This is secondary variant of Text</Text>
  </StackLayout>
);

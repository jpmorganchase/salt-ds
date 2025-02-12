import { StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Weight = (): ReactElement => (
  <StackLayout>
    <Text>
      <small>This is a thinner font weight</small>
    </Text>
    <Text>This is the default font weight</Text>
    <Text>
      <strong>This is a stronger font weight</strong>
    </Text>
  </StackLayout>
);

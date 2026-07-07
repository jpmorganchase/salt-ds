import { Avatar, FlowLayout, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Kind = (): ReactElement => (
  <FlowLayout gap={3}>
    <StackLayout align="center" gap={1}>
      <Avatar kind="person" name="John Doe" />
      <Text>Person</Text>
    </StackLayout>
    <StackLayout align="center" gap={1}>
      <Avatar kind="entity" name="JPMC" />
      <Text>Entity</Text>
    </StackLayout>
  </FlowLayout>
);

import { Avatar, FlowLayout, Label, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Kind = (): ReactElement => (
  <FlowLayout gap={3}>
    <StackLayout align="center" gap={1}>
      <Avatar kind="person" name="John Doe" />
      <Label>Person</Label>
    </StackLayout>
    <StackLayout align="center" gap={1}>
      <Avatar kind="entity" name="JPMC" />
      <Label>Entity</Label>
    </StackLayout>
  </FlowLayout>
);

import { Avatar, FlowLayout, Label, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Represents = (): ReactElement => (
  <FlowLayout gap={3}>
    <StackLayout align="center" gap={1}>
      <Avatar represents="person" name="Alex Brailescu" />
      <Label>Person</Label>
    </StackLayout>
    <StackLayout align="center" gap={1}>
      <Avatar represents="business" name="Blackrock" />
      <Label>Business</Label>
    </StackLayout>
  </FlowLayout>
);

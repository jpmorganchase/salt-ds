import { ReactElement } from "react";
import { Button, StackLayout } from "@salt-ds/core";
import { SegmentedButtonGroup } from "@salt-ds/lab";

export const Variants = (): ReactElement => (
  <StackLayout>
    <SegmentedButtonGroup>
      <Button>Button</Button>
      <Button>Button</Button>
      <Button>Button</Button>
    </SegmentedButtonGroup>
    <SegmentedButtonGroup>
      <Button variant="secondary">Button</Button>
      <Button variant="secondary">Button</Button>
      <Button variant="secondary">Button</Button>
    </SegmentedButtonGroup>
    <SegmentedButtonGroup>
      <Button variant="cta">Button</Button>
      <Button variant="cta">Button</Button>
      <Button variant="cta">Button</Button>
    </SegmentedButtonGroup>
  </StackLayout>
);

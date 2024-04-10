import { ReactElement } from "react";
import { Button, StackLayout, Tooltip } from "@salt-ds/core";

export const Placement = (): ReactElement => (
  <StackLayout direction="row">
    <Tooltip content="I am a tooltip" placement={"left"}>
      <Button>Left</Button>
    </Tooltip>
    <Tooltip content="I am a tooltip" placement={"top"}>
      <Button>Top</Button>
    </Tooltip>
    <Tooltip content="I am a tooltip" placement={"bottom"}>
      <Button>Bottom</Button>
    </Tooltip>
    <Tooltip content="I am a tooltip" placement={"right"}>
      <Button>Right</Button>
    </Tooltip>
  </StackLayout>
);

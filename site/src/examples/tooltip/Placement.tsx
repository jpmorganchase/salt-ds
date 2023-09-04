import { ReactElement } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const Placement = (): ReactElement => (
  <div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip content="I am a tooltip" placement={"top"}>
        <Button>Top</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 40 }}>
      <Tooltip content="I am a tooltip" placement={"bottom"}>
        <Button>Bottom</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip content="I am a tooltip" placement={"left"}>
        <Button>Left</Button>
      </Tooltip>
    </div>
    <Tooltip content="I am a tooltip" placement={"right"}>
      <Button>Right</Button>
    </Tooltip>
  </div>
);

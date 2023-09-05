import { ReactElement } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const DelayBeforeShown = (): ReactElement => (
  <div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip content="I am a tooltip" enterDelay={100}>
        <Button>100ms</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip content="I am a tooltip">
        <Button>300ms</Button>
      </Tooltip>
    </div>
    <Tooltip content="I am a tooltip" enterDelay={500}>
      <Button>500ms</Button>
    </Tooltip>
  </div>
);

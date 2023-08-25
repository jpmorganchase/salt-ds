import { ReactElement } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const Status = (): ReactElement => (
  <div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip content="I am a tooltip" status="info">
        <Button>Info</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip content="We found an issue" status="error">
        <Button>Error</Button>
      </Tooltip>
    </div>
    <div style={{ marginBottom: 10 }}>
      <Tooltip content="Are you sure" status="warning">
        <Button>Warning</Button>
      </Tooltip>
    </div>
    <Tooltip content="Well done" status="success">
      <Button>Success</Button>
    </Tooltip>
  </div>
);

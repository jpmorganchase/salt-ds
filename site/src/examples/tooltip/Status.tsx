import { ReactElement } from "react";
import { Button, StackLayout, Tooltip } from "@salt-ds/core";

export const Status = (): ReactElement => (
  <StackLayout gap={1}>
    <Tooltip content="I am a tooltip" status="info">
      <Button>Info</Button>
    </Tooltip>
    <Tooltip content="We found an issue" status="error">
      <Button>Error</Button>
    </Tooltip>
    <Tooltip content="Are you sure" status="warning">
      <Button>Warning</Button>
    </Tooltip>
    <Tooltip content="Well done" status="success">
      <Button>Success</Button>
    </Tooltip>
  </StackLayout>
);

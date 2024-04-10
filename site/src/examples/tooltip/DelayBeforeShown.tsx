import { ReactElement } from "react";
import { Button, StackLayout, Tooltip } from "@salt-ds/core";

export const DelayBeforeShown = (): ReactElement => (
  <StackLayout gap={1}>
    <Tooltip content="I am a tooltip" enterDelay={100}>
      <Button>100ms</Button>
    </Tooltip>
    <Tooltip content="I am a tooltip">
      <Button>300ms</Button>
    </Tooltip>
    <Tooltip content="I am a tooltip" enterDelay={500}>
      <Button>500ms</Button>
    </Tooltip>
  </StackLayout>
);

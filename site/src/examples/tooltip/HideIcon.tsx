import { ReactElement } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const HideIcon = (): ReactElement => (
  <Tooltip content="I am a tooltip" hideIcon>
    <Button>Without Icon</Button>
  </Tooltip>
);

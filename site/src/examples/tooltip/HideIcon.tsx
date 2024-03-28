import { ReactElement } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const HideIcon = (): ReactElement => (
  <Tooltip status="info" content="I am a tooltip" hideIcon>
    <Button>Without Icon</Button>
  </Tooltip>
);

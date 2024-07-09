import { Button, Tooltip } from "@salt-ds/core";
import type { ReactElement } from "react";

export const HideIcon = (): ReactElement => (
  <Tooltip status="info" content="I am a tooltip" hideIcon>
    <Button>Without Icon</Button>
  </Tooltip>
);

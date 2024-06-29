import { Button, Tooltip } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Tooltip content="I am a tooltip">
    <Button>Hover</Button>
  </Tooltip>
);

import { ReactElement } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const Default = (): ReactElement => (
  <Tooltip content="I am a tooltip">
    <Button>Hover</Button>
  </Tooltip>
);

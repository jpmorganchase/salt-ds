import { ReactElement } from "react";
import { Button, Tooltip } from "@salt-ds/core";

export const HideArrow = (): ReactElement => (
  <Tooltip content="I am a tooltip" hideArrow>
    <Button>Without Arrow</Button>
  </Tooltip>
);

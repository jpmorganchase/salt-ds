import { Button, Tooltip } from "@salt-ds/core";
import type { ReactElement } from "react";

export const HideArrow = (): ReactElement => (
  <Tooltip content="I am a tooltip" hideArrow>
    <Button>Without Arrow</Button>
  </Tooltip>
);

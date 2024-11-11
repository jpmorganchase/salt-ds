import { Button } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FocusableWhenDisabled = (): ReactElement => (
  <Button appearance="solid" disabled focusableWhenDisabled>
    Focusable when disabled
  </Button>
);

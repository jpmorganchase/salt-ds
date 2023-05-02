import { ReactElement } from "react";
import { Button } from "@salt-ds/core";

export const Disabled = (): ReactElement => (
  <>
    <Button variant="primary" disabled>
      Disabled
    </Button>
    <Button variant="primary" disabled focusableWhenDisabled>
      Focusable when disabled
    </Button>
  </>
);

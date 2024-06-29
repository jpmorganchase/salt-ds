import { Button } from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <>
    <Button variant="primary" disabled>
      Disabled
    </Button>
    <Button variant="primary" disabled>
      Disabled <SendIcon />
    </Button>
    <Button variant="primary" disabled focusableWhenDisabled>
      Focusable when disabled
    </Button>
  </>
);

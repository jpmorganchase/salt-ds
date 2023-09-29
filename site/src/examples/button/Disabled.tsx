import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";

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

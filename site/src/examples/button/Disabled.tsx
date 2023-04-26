import { Button } from "@salt-ds/core";

export const Disabled = () => (
  <>
    <Button variant="primary" disabled>
      Disabled
    </Button>
    <Button variant="primary" disabled focusableWhenDisabled>
      Focusable when disabled
    </Button>
  </>
);

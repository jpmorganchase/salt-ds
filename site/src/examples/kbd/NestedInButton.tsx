import { Button, StackLayout } from "@salt-ds/core";
import { Kbd } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const NestedInButton = (): ReactElement => (
  <StackLayout gap={"10px"} align="center">
    <Button appearance="solid" sentiment="accented">
      Save <Kbd>Cmd+S</Kbd>
    </Button>
    <Button>
      Cancel <Kbd>esc</Kbd>
    </Button>
  </StackLayout>
);

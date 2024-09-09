import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <FlowLayout>
    <Button appearance="solid" disabled>
      Disabled
    </Button>
    <Button appearance="bordered" disabled>
      Disabled <SendIcon />
    </Button>
    <Button appearance="transparent" disabled>
      Focusable when disabled
    </Button>
  </FlowLayout>
);

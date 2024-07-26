import { Button, GridLayout } from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const FocusableWhenDisabled = (): ReactElement => (
  <GridLayout columns={3}>
    <Button appearance="solid" color="accent" disabled focusableWhenDisabled>
      Solid
    </Button>
    <Button appearance="outline" color="accent" disabled focusableWhenDisabled>
      Outline
    </Button>
    <Button
      appearance="transparent"
      color="accent"
      disabled
      focusableWhenDisabled
    >
      Transparent
    </Button>
    <Button appearance="solid" color="neutral" disabled focusableWhenDisabled>
      Solid
    </Button>
    <Button appearance="outline" color="neutral" disabled focusableWhenDisabled>
      Outline
    </Button>
    <Button
      appearance="transparent"
      color="neutral"
      disabled
      focusableWhenDisabled
    >
      Transparent
    </Button>
  </GridLayout>
);

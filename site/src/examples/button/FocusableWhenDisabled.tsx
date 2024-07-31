import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FocusableWhenDisabled = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" color="accent" disabled focusableWhenDisabled>
        Solid
      </Button>
      <Button
        appearance="outline"
        color="accent"
        disabled
        focusableWhenDisabled
      >
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
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" color="neutral" disabled focusableWhenDisabled>
        Solid
      </Button>
      <Button
        appearance="outline"
        color="neutral"
        disabled
        focusableWhenDisabled
      >
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
    </FlowLayout>
  </StackLayout>
);

import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const FocusableWhenDisabled = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" color="accent" disabled focusableWhenDisabled>
        Solid
      </Button>
      <Button
        appearance="bordered"
        color="accent"
        disabled
        focusableWhenDisabled
      >
        Bordered
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
        appearance="bordered"
        color="neutral"
        disabled
        focusableWhenDisabled
      >
        Bordered
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

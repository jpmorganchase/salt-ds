import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" color="accent" disabled>
        Solid
      </Button>
      <Button appearance="outline" color="accent" disabled>
        Outline
      </Button>
      <Button appearance="transparent" color="accent" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" color="neutral" disabled>
        Solid
      </Button>
      <Button appearance="outline" color="neutral" disabled>
        Outline
      </Button>
      <Button appearance="transparent" color="neutral" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" color="positive" disabled>
        Solid
      </Button>
      <Button appearance="outline" color="positive" disabled>
        Outline
      </Button>
      <Button appearance="transparent" color="positive" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" color="negative" disabled>
        Solid
      </Button>
      <Button appearance="outline" color="negative" disabled>
        Outline
      </Button>
      <Button appearance="transparent" color="negative" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" color="warning" disabled>
        Solid
      </Button>
      <Button appearance="outline" color="warning" disabled>
        Outline
      </Button>
      <Button appearance="transparent" color="warning" disabled>
        Transparent
      </Button>
    </FlowLayout>
  </StackLayout>
);

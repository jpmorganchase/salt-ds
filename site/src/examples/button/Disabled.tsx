import { Button, FlowLayout, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <StackLayout gap={3}>
    <FlowLayout>
      <Button appearance="solid" sentiment="positive" disabled>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="positive" disabled>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="positive" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="accented" disabled>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="accented" disabled>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="accented" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="neutral" disabled>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="neutral" disabled>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="neutral" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="caution" disabled>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="caution" disabled>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="caution" disabled>
        Transparent
      </Button>
    </FlowLayout>
    <FlowLayout>
      <Button appearance="solid" sentiment="negative" disabled>
        Solid
      </Button>
      <Button appearance="bordered" sentiment="negative" disabled>
        Bordered
      </Button>
      <Button appearance="transparent" sentiment="negative" disabled>
        Transparent
      </Button>
    </FlowLayout>
  </StackLayout>
);

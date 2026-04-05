// @ts-nocheck
import { Button, FlexLayout } from "@salt-ds/core";

export function ToolbarAction() {
  return (
    <FlexLayout align="center" gap={1}>
      <Button href="/portfolio">Portfolio</Button>
      <Button appearance="secondary">Refresh</Button>
    </FlexLayout>
  );
}

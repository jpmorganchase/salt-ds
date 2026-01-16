import { FlexLayout } from "@salt-ds/core";
import { Kbd } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <FlexLayout gap={2}>
    <Kbd>Cmd</Kbd>
    <Kbd>Shift</Kbd>
    <Kbd>Ctrl</Kbd>
  </FlexLayout>
);

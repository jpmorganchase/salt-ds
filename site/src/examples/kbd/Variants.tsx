import { FlexLayout } from "@salt-ds/core";
import { Kbd } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => (
  <FlexLayout gap={2}>
    <Kbd>cmd</Kbd>
    <Kbd variant="secondary">shift</Kbd>
    <Kbd variant="tertiary">ctrl</Kbd>
  </FlexLayout>
);

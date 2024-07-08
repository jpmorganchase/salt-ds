import { Divider, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Vertical = (): ReactElement => {
  return (
    <StackLayout direction="row" gap={10} style={{ height: "200px" }}>
      <Divider orientation="vertical" />
      <Divider orientation="vertical" variant="secondary" />
      <Divider orientation="vertical" variant="tertiary" />
    </StackLayout>
  );
};

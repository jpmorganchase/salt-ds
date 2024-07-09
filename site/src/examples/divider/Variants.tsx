import { Divider, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Variants = (): ReactElement => {
  return (
    <StackLayout gap={6} style={{ width: "200px" }}>
      <Divider />
      <Divider variant="secondary" />
      <Divider variant="tertiary" />
    </StackLayout>
  );
};

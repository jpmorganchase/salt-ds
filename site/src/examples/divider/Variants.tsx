import { ReactElement } from "react";
import { Divider } from "@salt-ds/lab";
import { StackLayout } from "@salt-ds/core";

export const Variants = (): ReactElement => {
  return (
    <StackLayout gap={6} style={{ width: "200px" }}>
      <Divider />
      <Divider variant="secondary" />
      <Divider variant="tertiary" />
    </StackLayout>
  );
};

import { ReactElement } from "react";
import { StackLayout } from "@salt-ds/core";
import { Divider } from "@salt-ds/lab";

export const Vertical = (): ReactElement => {
  return (
    <StackLayout style={{ width: "200px", justifyContent: "center" }}>
      <Divider orientation="vertical" />
    </StackLayout>
  );
};

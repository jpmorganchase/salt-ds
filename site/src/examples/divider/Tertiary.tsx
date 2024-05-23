import { ReactElement } from "react";
import { StackLayout } from "@salt-ds/core";
import { Divider } from "@salt-ds/lab";

export const Tertiary = (): ReactElement => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Divider variant="tertiary" />
    </StackLayout>
  );
};

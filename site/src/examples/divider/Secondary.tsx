import { ReactElement } from "react";
import { Divider } from "@salt-ds/lab";
import { Text, StackLayout } from "@salt-ds/core";

export const Secondary = (): ReactElement => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Text>About</Text>
      <Divider variant="secondary" />
      <Text>Patterns</Text>
    </StackLayout>
  );
};

import { ReactElement } from "react";
import { Divider } from "@salt-ds/lab";
import { Text, StackLayout } from "@salt-ds/core";

export const Primary = (): ReactElement => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Text>About</Text>
      <Divider />
      <Text>Patterns</Text>
    </StackLayout>
  );
};

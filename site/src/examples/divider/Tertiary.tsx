import { ReactElement } from "react";
import { StackLayout, Text } from "@salt-ds/core";
import { Divider } from "@salt-ds/lab";

export const Tertiary = (): ReactElement => {
  return (
    <StackLayout style={{ width: "400px" }}>
      <Text>About</Text>
      <Divider variant="tertiary" />
      <Text>Patterns</Text>
    </StackLayout>
  );
};

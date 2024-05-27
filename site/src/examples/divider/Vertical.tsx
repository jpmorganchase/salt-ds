import { ReactElement } from "react";
import { Divider } from "@salt-ds/lab";
import { Text, StackLayout } from "@salt-ds/core";

export const Vertical = (): ReactElement => {
  return (
    <StackLayout direction="row">
      <Text>About</Text>
      <Divider orientation="vertical" />
      <Text>Patterns</Text>
      <Divider orientation="vertical" />
      <Text>Foundation</Text>
      <Divider orientation="vertical" />
      <Text>Theming</Text>
    </StackLayout>
  );
};

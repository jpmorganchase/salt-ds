import { StackLayout, Text } from "@salt-ds/core";
import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const PageLoader = (): ReactElement => (
  <StackLayout
    align="center"
    gap={3}
    style={{ minHeight: 320, justifyContent: "center" }}
  >
    <Text styleAs="h2">My application</Text>
    <Progress shape="circular" size="large" label="Loading your accounts" />
  </StackLayout>
);

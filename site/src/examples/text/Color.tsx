import { StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const Color = (): ReactElement => (
  <StackLayout>
    <Text color="primary">This is primary color of Text</Text>
    <Text color="secondary">This is secondary color of Text</Text>
    <Text color="info">This is info color of Text</Text>
    <Text color="error">This is error color of Text</Text>
    <Text color="warning">This is warning color of Text</Text>
    <Text color="success">This is success color of Text</Text>
    <Text color="inherit">This is inherited color of Text</Text>
  </StackLayout>
);

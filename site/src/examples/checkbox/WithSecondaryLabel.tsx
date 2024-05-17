import { ReactElement } from "react";
import { Checkbox, Text, StackLayout } from "@salt-ds/core";

export const WithSecondaryLabel = (): ReactElement => {
  return (
    <Checkbox
      label={
        <StackLayout gap={0.5} align="start">
          <Text>Bonds</Text>
          <Text color="secondary">Debt securities</Text>
        </StackLayout>
      }
    />
  );
};

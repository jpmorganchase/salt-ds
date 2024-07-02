import { Checkbox, CheckboxGroup, StackLayout, Text } from "@salt-ds/core";
import type { ReactElement } from "react";

export const WithDescription = (): ReactElement => {
  return (
    <CheckboxGroup defaultCheckedValues={["alternatives", "equities"]}>
      <Checkbox
        value="alternatives"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>Alternatives</Text>
            <Text color="secondary">Other investments</Text>
          </StackLayout>
        }
      />
      <Checkbox
        value="equities"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>Equities</Text>
            <Text color="secondary">Company shares</Text>
          </StackLayout>
        }
      />
      <Checkbox
        value="fixed income"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>Fixed income</Text>
            <Text color="secondary">Interest-paying</Text>
          </StackLayout>
        }
      />
      <Checkbox
        value="bonds"
        label={
          <StackLayout gap={0.5} align="start">
            <Text>Bonds</Text>
            <Text color="secondary">Debt securities</Text>
          </StackLayout>
        }
      />
    </CheckboxGroup>
  );
};

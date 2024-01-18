import { ReactElement } from "react";
import { Card, Scrim, Spinner, StackLayout, Text } from "@salt-ds/core";

export const WithSpinner = (): ReactElement => {
  return (
    <Card style={{ position: "relative", width: "512px" }}>
      <StackLayout>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Text>
        <Scrim open>
          <Spinner size="medium" />
        </Scrim>
      </StackLayout>
    </Card>
  );
};

import { Spinner, StackLayout, Text } from "@salt-ds/core";

export const WithSpinner = () => {
  return (
    <StackLayout gap={3} align="center">
      <Spinner size="medium" />
      <StackLayout gap={1} align="center">
        <Text fontWeight="bolder">Loading…</Text>
        <Text>
          Sorry, we are experiencing a higher volume of requests than usual.
        </Text>
      </StackLayout>
    </StackLayout>
  );
};

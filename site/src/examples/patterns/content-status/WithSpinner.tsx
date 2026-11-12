import { Spinner, StackLayout, Text } from "@salt-ds/core";

export const WithSpinner = () => {
  return (
    <StackLayout gap={3} align="center">
      <Spinner size="medium" />
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
    </StackLayout>
  );
};

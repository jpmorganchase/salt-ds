import { CircularProgress, StackLayout, Text } from "@salt-ds/core";

export const WithProgress = () => {
  return (
    <StackLayout gap={3} align="center">
      <CircularProgress value={38} />
      <Text>
        Supplementary content can go here if required. This content area is
        flexible in height and width as needed.
      </Text>
    </StackLayout>
  );
};

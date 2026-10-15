import { Button, StackLayout, StatusIndicator, Text } from "@salt-ds/core";

export const Error = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="error" size={2} />
      <StackLayout gap={1} align="center">
        <Text styleAs="h4">
          <strong>Message title</strong>
        </Text>
        <Text>
          Supplementary content can go here if required. This content area is
          flexible in height and width as needed.
        </Text>
      </StackLayout>
      <Button>Reload</Button>
    </StackLayout>
  );
};

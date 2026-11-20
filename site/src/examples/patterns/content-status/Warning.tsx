import { Button, StackLayout, StatusIndicator, Text } from "@salt-ds/core";

export const Warning = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="warning" size={2} />
      <StackLayout gap={1} align="center">
        <Text fontWeight="bolder">Large dataset</Text>
        <Text>
          Data in this table may take longer than usual to load.
        </Text>
      </StackLayout>
      <Button>Proceed</Button>
    </StackLayout>
  );
};

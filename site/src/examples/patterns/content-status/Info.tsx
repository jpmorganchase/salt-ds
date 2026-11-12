import { Button, StackLayout, StatusIndicator, Text } from "@salt-ds/core";

export const Info = () => {
  return (
    <StackLayout gap={3} align="center">
      <StatusIndicator status="info" size={2} />
      <StackLayout gap={1} align="center">
        <Text fontWeight="bolder">No data available</Text>
        <Text>
          This table contains no entries.
        </Text>
      </StackLayout>
      <Button>Add entry</Button>
    </StackLayout>
  );
};

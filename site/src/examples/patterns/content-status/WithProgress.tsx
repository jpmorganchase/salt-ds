import { Button, CircularProgress, StackLayout, Text } from "@salt-ds/core";

export const WithProgress = () => {
  return (
    <StackLayout gap={3} align="center">
      <CircularProgress aria-label="Download progress" value={50} />
      <StackLayout gap={1} align="center">
        <Text fontWeight="bolder">Downloading…</Text>
        <Text>We’re retrieving your data. This shouldn’t take long.</Text>
      </StackLayout>
      <Button>Cancel</Button>
    </StackLayout>
  );
};

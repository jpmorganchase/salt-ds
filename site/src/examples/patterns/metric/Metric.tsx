import { Display1, StackLayout, Text } from "@salt-ds/core";

export const Metric = () => {
  return (
    <StackLayout gap={0}>
      <Text fontWeight="bolder">Performance</Text>
      <Display1>801</Display1>
    </StackLayout>
  );
};

import { Display1, StackLayout, Text } from "@salt-ds/core";

export const SubtitleAndSubvalue = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Performance</strong>
      </Text>
      <Text color="secondary">Interactions</Text>
      <Display1>801</Display1>
      <Text
        style={{
          color: "var(--salt-sentiment-positive-foreground-informative)",
        }}
      >
        +10 (+1.23%)
      </Text>
    </StackLayout>
  );
};

import { Display1, Link, StackLayout, Text } from "@salt-ds/core";

export const LinkSubtitle = () => {
  return (
    <StackLayout gap={0}>
      <Text>
        <strong>Performance</strong>
      </Text>
      <Link color="secondary">Interactions</Link>
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

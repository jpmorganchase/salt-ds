import { Card, H3, Link, StackLayout, Text } from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

export const FullWidthImage = (): ReactElement => {
  return (
    <Card style={{ "--saltCard-padding": 0, width: "260px" } as CSSProperties}>
      <img
        src="/img/examples/cardExample.jpg"
        alt="placeholder"
        style={{ width: "100%" }}
      />
      <StackLayout padding={2} align="start">
        <StackLayout padding={0} gap={1}>
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
        </StackLayout>
        <Link href="#" IconComponent={null}>
          Learn more
        </Link>
      </StackLayout>
    </Card>
  );
};

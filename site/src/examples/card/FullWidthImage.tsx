import { ReactElement, useState, CSSProperties } from "react";
import { H3, Text, StackLayout, Card } from "@salt-ds/core";

export const FullWidthImage = (): ReactElement => {
  return (
    <Card style={{ "--saltCard-padding": 0, width: "260px" } as CSSProperties}>
      <img src="/img/examples/cardExample.jpg" style={{ width: "100%" }} />
      <StackLayout
        gap={1}
        // Apply padding around the content below the image for a full width image
        style={{
          padding: "var(--salt-spacing-200)",
        }}
      >
        <H3>Sustainable investing products</H3>
        <Text>
          We have a commitment to provide a wide range of investment solutions
          to enable you to align your financial goals to your values.
        </Text>
      </StackLayout>
    </Card>
  );
};

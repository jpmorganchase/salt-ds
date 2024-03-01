import { ReactElement, CSSProperties } from "react";
import { H3, Text, StackLayout, Card, Link } from "@salt-ds/core";
import { Image } from "@jpmorganchase/mosaic-site-components";

export const FullWidthImage = (): ReactElement => {
  return (
    <Card style={{ "--saltCard-padding": 0, width: "260px" } as CSSProperties}>
      <Image
        src="/img/examples/cardExample.jpg"
        alt="placeholder image"
        style={{ width: "100%" }}
      />
      <StackLayout
        // Apply padding around the content below the image for a full width image
        style={{
          padding: "var(--salt-spacing-200)",
        }}
        align="start"
      >
        <StackLayout gap={1}>
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

import { Card, H3, Link, StackLayout, Text } from "@salt-ds/core";
import type { CSSProperties, ReactElement } from "react";

export const BackgroundImage = (): ReactElement => {
  return (
    <Card
      style={
        {
          backgroundImage: 'url("/img/examples/backgroundImg.png")',
          backgroundSize: "cover",
          //   Make sure text are visible on both light and dark modes
          "--salt-content-primary-foreground": "var(--salt-color-white)",
        } as CSSProperties
      }
    >
      <StackLayout align="start">
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
